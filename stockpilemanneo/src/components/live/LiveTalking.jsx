/**
 * @fileoverview Live voice talking page component using Gemini Live API and database tools.
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

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import SendIcon from "@mui/icons-material/Send";
import StorageIcon from "@mui/icons-material/Storage";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { deepPurple, green, amber, blue } from "@mui/material/colors";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import supabase from "../../client.js";
import GeminiLogo from "../../assets/gemini_logo.png";
import AudioVisualizer from "./AudioVisualizer.jsx";
import { LiveService } from "./LiveService.js";
import { DEFAULT_LIVE_MODEL, LIVE_MODELS, LIVE_VOICES } from "./liveConstants.js";

function LiveTalking() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'connecting' | 'listening' | 'speaking' | 'executing_tool' | 'error' | 'disconnected'
  const [micVolume, setMicVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [inputText, setInputText] = useState('');
  const [model, setModel] = useState(DEFAULT_LIVE_MODEL);
  const [voice, setVoice] = useState('Puck');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const liveServiceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
      }
    };
    checkAuth();
  }, [navigate]);

  // Initialize and register callbacks on the LiveService instance
  useEffect(() => {
    liveServiceRef.current = new LiveService({
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onTranscriptUpdate: (message) => {
        setTranscript((prev) => [...prev, message]);
      },
      onVolumeChange: (micVol, aiVol) => {
        setMicVolume(micVol);
        setAiVolume(aiVol);
      },
      onError: (err) => {
        setErrorMessage(typeof err === 'string' ? err : err?.message || 'エラーが発生しました');
      },
    });

    return () => {
      if (liveServiceRef.current) {
        liveServiceRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to latest message in transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleToggleCall = async () => {
    if (status === 'idle' || status === 'disconnected' || status === 'error') {
      try {
        setInfoMessage('Gemini Live に接続しています...');
        await liveServiceRef.current?.start({ model, voice });
        setInfoMessage('通話を開始しました。お話しください。');
      } catch (e) {
        setErrorMessage(e?.message || '通話の開始に失敗しました。');
      }
    } else {
      liveServiceRef.current?.stop();
      setInfoMessage('通話を終了しました。');
    }
  };

  const handleToggleMicMute = () => {
    const nextMute = !isMicMuted;
    setIsMicMuted(nextMute);
    liveServiceRef.current?.setMicMute(nextMute);
  };

  const handleToggleSpeakerMute = () => {
    const nextMute = !isSpeakerMuted;
    setIsSpeakerMuted(nextMute);
    liveServiceRef.current?.setSpeakerMute(nextMute);
  };

  const handleSendTextMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (status === 'idle' || status === 'disconnected') {
      setErrorMessage('テキストを送信するには、まず通話を開始してください。');
      return;
    }

    liveServiceRef.current?.sendTextMessage(inputText);
    setInputText('');
  };

  const handleClearTranscript = () => {
    setTranscript([]);
  };

  const getStatusChip = () => {
    switch (status) {
      case 'connecting':
        return <Chip icon={<CircularProgress size={16} color="inherit" />} label="接続中..." color="info" variant="outlined" />;
      case 'listening':
        return <Chip icon={<MicIcon />} label="聞き取り中" sx={{ bgcolor: green[100], color: green[900], fontWeight: 'bold' }} />;
      case 'speaking':
        return <Chip icon={<RecordVoiceOverIcon />} label="Gemini 応答中" sx={{ bgcolor: deepPurple[100], color: deepPurple[900], fontWeight: 'bold' }} />;
      case 'executing_tool':
        return <Chip icon={<StorageIcon />} label="データベース検索中" sx={{ bgcolor: amber[100], color: amber[900], fontWeight: 'bold' }} />;
      case 'error':
        return <Chip label="エラー" color="error" />;
      default:
        return <Chip label="未通話" variant="outlined" />;
    }
  };

  const isCallActive = status === 'connecting' || status === 'listening' || status === 'speaking' || status === 'executing_tool';

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', p: { xs: 1.5, sm: 3 } }}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,1) 100%)',
        }}
      >
        {/* Header & Settings */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={GeminiLogo} sx={{ width: 36, height: 36 }} />
            <div>
              <Typography variant="h6" fontWeight="bold">
                Gemini Live 音声通話
              </Typography>
              <Typography variant="caption" color="text.secondary">
                音声でリアルタイムに在庫検索・確認ができます
              </Typography>
            </div>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusChip()}
          </Box>
        </Box>

        <Divider />

        {/* Voice and Model Selection */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
            <InputLabel id="live-voice-label">ボイス設定</InputLabel>
            <Select
              labelId="live-voice-label"
              value={voice}
              label="ボイス設定"
              disabled={isCallActive}
              onChange={(e) => setVoice(e.target.value)}
            >
              {LIVE_VOICES.map((v) => (
                <MenuItem key={v.name} value={v.name}>
                  {v.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
            <InputLabel id="live-model-label">モデル</InputLabel>
            <Select
              labelId="live-model-label"
              value={model}
              label="モデル"
              disabled={isCallActive}
              onChange={(e) => setModel(e.target.value)}
            >
              {LIVE_MODELS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Central Audio Visualizer Hub */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <AudioVisualizer
            status={status}
            micVolume={micVolume}
            aiVolume={aiVolume}
            statusText={
              status === 'speaking'
                ? 'Gemini が話しています（話しかけると割り込めます）'
                : status === 'listening'
                ? 'お話しください（在庫や賞味期限について質問できます）'
                : status === 'executing_tool'
                ? 'データベースを検索中...'
                : status === 'connecting'
                ? 'Gemini Live サーバーに接続中...'
                : '「通話開始」ボタンを押して会話を始めます'
            }
          />

          {/* Interactive Control Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
            <Tooltip title={isMicMuted ? 'マイクのミュート解除' : 'マイクをミュート'}>
              <span>
                <IconButton
                  color={isMicMuted ? 'error' : 'primary'}
                  onClick={handleToggleMicMute}
                  disabled={!isCallActive}
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  {isMicMuted ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              size="large"
              color={isCallActive ? 'error' : 'primary'}
              startIcon={isCallActive ? <CallEndIcon /> : <MicIcon />}
              onClick={handleToggleCall}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 8,
                fontWeight: 'bold',
                boxShadow: isCallActive ? '0 4px 14px rgba(244,67,54,0.4)' : '0 4px 14px rgba(25,118,210,0.3)',
              }}
            >
              {isCallActive ? '通話終了' : '通話開始'}
            </Button>

            <Tooltip title={isSpeakerMuted ? 'スピーカーのミュート解除' : 'スピーカーをミュート'}>
              <span>
                <IconButton
                  color={isSpeakerMuted ? 'error' : 'primary'}
                  onClick={handleToggleSpeakerMute}
                  disabled={!isCallActive}
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  {isSpeakerMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        {/* Live Conversation Transcript */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              会話ログ & データベース検索履歴
            </Typography>
            {transcript.length > 0 ? (
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleClearTranscript}
                color="inherit"
              >
                クリア
              </Button>
            ) : null}
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: 380,
              minHeight: 180,
              overflowY: 'auto',
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {transcript.length === 0 ? (
              <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary', py: 4 }}>
                <RecordVoiceOverIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2">
                  通話を開始して話しかけると、ここに会話内容と在庫検索の履歴が表示されます。
                </Typography>
              </Box>
            ) : (
              transcript.map((msg) => {
                if (msg.role === 'system') {
                  return (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                      <Chip
                        size="small"
                        label={msg.text}
                        sx={{ bgcolor: 'rgba(0,0,0,0.06)', fontSize: '0.75rem' }}
                      />
                    </Box>
                  );
                }

                if (msg.role === 'tool') {
                  return (
                    <Card
                      key={msg.id}
                      variant="outlined"
                      sx={{
                        bgcolor: amber[50],
                        borderColor: amber[200],
                        borderRadius: 2,
                      }}
                    >
                      <CardHeader
                        avatar={<StorageIcon sx={{ color: amber[800], fontSize: 20 }} />}
                        title={
                          <Typography variant="caption" fontWeight="bold" color={amber[900]}>
                            {msg.text}
                          </Typography>
                        }
                        sx={{ py: 1, px: 1.5 }}
                      />
                    </Card>
                  );
                }

                const isModel = msg.role === 'model';

                return (
                  <Card
                    key={msg.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      alignSelf: isModel ? 'flex-start' : 'flex-end',
                      maxWidth: { xs: '95%', sm: '85%' },
                      bgcolor: isModel ? 'background.paper' : blue[50],
                      borderColor: isModel ? 'divider' : blue[200],
                    }}
                  >
                    <CardHeader
                      avatar={
                        isModel ? (
                          <Avatar src={GeminiLogo} sx={{ width: 28, height: 28 }} />
                        ) : (
                          <Avatar sx={{ bgcolor: deepPurple[500], width: 28, height: 28 }}>
                            <AccountCircleIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                        )
                      }
                      title={
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                          {isModel ? 'Gemini' : 'あなた'}
                        </Typography>
                      }
                      sx={{ py: 1, px: 1.5 }}
                    />
                    <CardContent sx={{ py: 0.5, px: 1.5, '&:last-child': { pb: 1 } }}>
                      <Markdown>{msg.text || ''}</Markdown>
                    </CardContent>
                  </Card>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Paper>
        </Box>

        {/* Text Input Fallback */}
        <Box component="form" onSubmit={handleSendTextMessage}>
          <TextField
            fullWidth
            size="small"
            placeholder={isCallActive ? "テキストで話しかけることもできます..." : "通話を開始するとテキスト送信も利用できます"}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!isCallActive}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!isCallActive || !inputText.trim()}
                    edge="end"
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Notification Snackbars */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(infoMessage)}
        autoHideDuration={4000}
        onClose={() => setInfoMessage('')}
      >
        <Alert severity="info" onClose={() => setInfoMessage('')} sx={{ width: '100%' }}>
          {infoMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LiveTalking;
