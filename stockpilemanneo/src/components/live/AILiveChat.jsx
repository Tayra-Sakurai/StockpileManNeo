/**
 * @fileoverview AI live chatting UI component.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */

import { Alert, Box, Button, Chip, CircularProgress, FormControl, Grid, IconButton, InputLabel, LinearProgress, MenuItem, Paper, Select, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PhoneIcon from "@mui/icons-material/Phone";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import SendIcon from "@mui/icons-material/Send";
import StorageIcon from "@mui/icons-material/Storage";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import supabase from "../../client.js";
import aimodel from "../../aimodules/Gemini.jsx";
import ChatCard from "../chat/ChatCard.jsx";
import { AVAILABLE_VOICES, DEFAULT_LIVE_MODEL, DEFAULT_VOICE, FALLBACK_LIVE_MODELS } from "./liveConstants.js";
import { LiveAudioService } from "./LiveAudioService.js";
import { LiveClient } from "./LiveClient.js";

/**
 * AI live chatting UI component.
 * @returns {import("react").JSX.Element}
 */
function AILiveChat() {
  const navigate = useNavigate();

  // Model and voice configuration state
  const [model, setModel] = useState(DEFAULT_LIVE_MODEL);
  const [models, setModels] = useState(FALLBACK_LIVE_MODELS);
  const [voice, setVoice] = useState(DEFAULT_VOICE);

  // Live session status state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);

  // Conversation transcripts and messaging
  const [chatMessages, setChatMessages] = useState([]);
  const [textInput, setTextInput] = useState('');

  // Alerts and Snackbars
  const [errorMessage, setErrorMessage] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);

  // Backend service references
  const audioServiceRef = useRef(null);
  const liveClientRef = useRef(null);
  const currentModelMessageRef = useRef('');

  // Check Supabase authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
      }
    };
    checkAuth();
  }, [navigate]);

  // Load available generative models dynamically from GoogleGenAI.models.list()
  useEffect(() => {
    const loadModels = async () => {
      try {
        const loadedModels = [];
        for await (const availableModel of await aimodel.models.list()) {
          if (
            availableModel.supportedActions?.includes('generateContent') ||
            availableModel.supportedActions?.includes('bidiGenerateContent')
          ) {
            loadedModels.push({
              name: availableModel.name?.startsWith('models/') ? availableModel.name : `models/${availableModel.name}`,
              displayName: availableModel.displayName || availableModel.name,
            });
          }
        }

        if (loadedModels.length > 0) {
          setModels(loadedModels);
          setModel(prev => {
            const found = loadedModels.find(m => m.name === prev || m.name === DEFAULT_LIVE_MODEL);
            return found ? found.name : loadedModels[0].name;
          });
        }
      } catch (err) {
        console.error('Failed to retrieve models dynamically from GoogleGenAI.models.list():', err);
      }
    };

    loadModels();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.stop();
        audioServiceRef.current = null;
      }
      if (liveClientRef.current) {
        liveClientRef.current.disconnect();
        liveClientRef.current = null;
      }
    };
  }, []);

  // Handle start/stop live session
  const startLiveSession = async () => {
    setIsConnecting(true);
    setErrorMessage('');
    currentModelMessageRef.current = '';

    try {
      // 1. Initialize Audio Service
      const audioService = new LiveAudioService();
      audioServiceRef.current = audioService;

      audioService.onInputLevel = (level) => {
        setInputLevel(level);
      };

      audioService.onOutputLevel = (level) => {
        setOutputLevel(level);
        setIsAiSpeaking(level > 2);
      };

      await audioService.startRecording();

      // 2. Initialize WebSocket Live Client
      const liveClient = new LiveClient({
        model,
        voice,
      });
      liveClientRef.current = liveClient;

      // Pipe mic audio chunk to WebSocket
      audioService.onAudioChunk = (base64Chunk) => {
        liveClient.sendAudioChunk(base64Chunk);
      };

      // Handle server callbacks
      liveClient.onConnected = () => {
        setIsConnecting(false);
        setIsConnected(true);
        setInfoMessage('Live通話が開始されました。AIにお話しください。');
        setInfoOpen(true);
      };

      liveClient.onDisconnected = (reason) => {
        setIsConnected(false);
        setIsConnecting(false);
        setIsAiSpeaking(false);
        setIsSearchingDb(false);
        audioService.stop();
        if (reason) {
          setInfoMessage(`通話が終了しました（${reason}）`);
          setInfoOpen(true);
        }
      };

      liveClient.onError = (err) => {
        console.error('Live client error:', err);
        setErrorMessage(err?.message || 'ライブ接続でエラーが発生しました。');
        setErrorOpen(true);
        setIsConnecting(false);
      };

      liveClient.onAudioData = (base64Pcm) => {
        audioService.playAudioChunk(base64Pcm);
      };

      liveClient.onInterrupted = () => {
        audioService.interrupt();
        setIsAiSpeaking(false);
      };

      liveClient.onUserTranscript = (text) => {
        if (!text) return;
        setChatMessages(prev => [
          ...prev,
          { role: 'user', markdown: text },
        ]);
      };

      liveClient.onModelTranscript = (text) => {
        if (!text) return;
        currentModelMessageRef.current += text;
        setChatMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'model' && lastMsg.isLiveStreaming) {
            return [
              ...prev.slice(0, -1),
              { role: 'model', markdown: currentModelMessageRef.current, isLiveStreaming: true },
            ];
          } else {
            return [
              ...prev,
              { role: 'model', markdown: currentModelMessageRef.current, isLiveStreaming: true },
            ];
          }
        });
      };

      liveClient.onTurnComplete = () => {
        currentModelMessageRef.current = '';
        setChatMessages(prev =>
          prev.map(msg => msg.isLiveStreaming ? { ...msg, isLiveStreaming: false } : msg)
        );
        setIsAiSpeaking(false);
      };

      liveClient.onToolCallStart = () => {
        setIsSearchingDb(true);
        setInfoMessage('データベースを検索しています...');
        setInfoOpen(true);
      };

      liveClient.onToolCallComplete = () => {
        setIsSearchingDb(false);
      };

      liveClient.onStatusMessage = (status) => {
        setInfoMessage(status);
        setInfoOpen(true);
      };

      await liveClient.connect();
    } catch (err) {
      console.error('Failed to start live session:', err);
      setErrorMessage(err?.message || 'マイクへのアクセスまたは接続に失敗しました。');
      setErrorOpen(true);
      setIsConnecting(false);
      setIsConnected(false);
      if (audioServiceRef.current) {
        audioServiceRef.current.stop();
        audioServiceRef.current = null;
      }
    }
  };

  const stopLiveSession = () => {
    if (audioServiceRef.current) {
      audioServiceRef.current.stop();
      audioServiceRef.current = null;
    }
    if (liveClientRef.current) {
      liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsAiSpeaking(false);
    setIsSearchingDb(false);
    setInputLevel(0);
    setOutputLevel(0);
    setInfoMessage('Live通話を終了しました。');
    setInfoOpen(true);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioServiceRef.current) {
      audioServiceRef.current.setMuted(newMuted);
    }
  };

  const handleSendTextMessage = (e) => {
    e?.preventDefault();
    if (!textInput.trim()) return;

    const text = textInput.trim();
    setTextInput('');

    setChatMessages(prev => [
      ...prev,
      { role: 'user', markdown: text },
    ]);

    if (liveClientRef.current && isConnected) {
      liveClientRef.current.sendTextMessage(text);
    } else {
      setErrorMessage('Live通話に接続されていないためテキストを送信できません。');
      setErrorOpen(true);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 2,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RecordVoiceOverIcon color="primary" />
          AI Live 対話
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gemini Live APIを利用して、音声とテキストでリアルタイムに在庫の確認や相談ができます。
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" disabled={isConnected || isConnecting}>
              <InputLabel id="live-model-select-label">AIモデル</InputLabel>
              <Select
                labelId="live-model-select-label"
                id="live-model-select"
                value={model}
                label="AIモデル"
                onChange={(e) => setModel(e.target.value)}
              >
                {models.map((m) => (
                  <MenuItem key={m.name} value={m.name}>
                    {m.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" disabled={isConnected || isConnecting}>
              <InputLabel id="live-voice-select-label">AI音声</InputLabel>
              <Select
                labelId="live-voice-select-label"
                id="live-voice-select"
                value={voice}
                label="AI音声"
                onChange={(e) => setVoice(e.target.value)}
              >
                {AVAILABLE_VOICES.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2}>
          {!isConnected ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : <PhoneIcon />}
              onClick={startLiveSession}
              disabled={isConnecting}
            >
              {isConnecting ? '接続中...' : 'Live通話を開始'}
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="error"
                startIcon={<PhoneDisabledIcon />}
                onClick={stopLiveSession}
              >
                通話を終了
              </Button>
              <IconButton
                color={isMuted ? 'error' : 'primary'}
                onClick={toggleMute}
                aria-label={isMuted ? 'マイクのミュート解除' : 'マイクをミュート'}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </>
          )}

          {isConnected && (
            <Chip
              label={isSearchingDb ? 'データベース検索中' : isAiSpeaking ? 'AI発話中' : isMuted ? 'マイク: ミュート中' : '聞き取り中...'}
              color={isSearchingDb ? 'secondary' : isAiSpeaking ? 'success' : isMuted ? 'warning' : 'primary'}
              variant="outlined"
              icon={isSearchingDb ? <StorageIcon /> : <RecordVoiceOverIcon />}
            />
          )}
        </Stack>

        {isConnected && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              マイク入力レベル:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={isMuted ? 0 : Math.min(100, inputLevel * 2)}
              color={isMuted ? 'inherit' : 'primary'}
              sx={{ height: 6, borderRadius: 1, my: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              AI音声出力レベル:
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, outputLevel * 2)}
              color="success"
              sx={{ height: 6, borderRadius: 1, my: 0.5 }}
            />
          </Box>
        )}
      </Paper>

      {/* Transcript / Conversation History */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        {chatMessages.map((msg, index) => (
          <ChatCard key={index} role={msg.role} markdown={msg.markdown} />
        ))}
      </Stack>

      {/* Text Prompt input when in Live session */}
      {isConnected && (
        <Paper
          component="form"
          onSubmit={handleSendTextMessage}
          sx={{
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="テキストで質問や指示を入力..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <IconButton color="primary" type="submit" disabled={!textInput.trim()} aria-label="送信">
            <SendIcon />
          </IconButton>
        </Paper>
      )}

      {/* Error Alert Snackbar */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={() => setErrorOpen(false)}
      >
        <Alert severity="error" onClose={() => setErrorOpen(false)} sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Info Alert Snackbar */}
      <Snackbar
        open={infoOpen}
        autoHideDuration={4000}
        onClose={() => setInfoOpen(false)}
      >
        <Alert severity="info" onClose={() => setInfoOpen(false)} sx={{ width: '100%' }}>
          {infoMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AILiveChat;