import { Alert, Box, Paper, Snackbar, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ChatCard from "./ChatCard.jsx";
import PromptEditor from "./PromptEditor.jsx";
import { execFuncCall, tools } from "../../aimodules/Functions/DbFunctions.js";
import aimodel from "../../aimodules/Gemini.jsx";
import asynchronousTimer from "../../timers/AsynchronousTimer.js";
import { GEMINI_MODEL, generation_config } from "./constants.js";

function AIChat() {
  console.info(`Model: ${GEMINI_MODEL}`);
  /**
   * @type {[
   *   ?import("@google/genai").Interactions.Interaction,
   *   import("react").Dispatch.<import("react").SetStateAction.<?import("@google/genai").Interactions.Interaction>>
   * ]}
   */
  const [interaction, setInteraction] = useState(null);

  /**
   * @type {[
   *   {role: "model" | "user", markdown: string}[],
   *   import("react").Dispatch.<import("react").SetStateAction.<{role: "model" | "user", markdown: string}[]>>
   * ]}
   */
  const [chat, setChat] = useState([]);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const [message2, setMessage2] = useState('');
  const [open2, setOpen2] = useState(false);

  const [maxTokens, setMaxTokens] = useState(0);

  const [model, setModel] = useState(GEMINI_MODEL);
  const [timeoutLength, setTimeoutLength] = useState(4000);

  /**
   * The close action handler.
   * @param {import("react").SyntheticEvent<any> | Event} event The event object.
   * @param {import("@mui/material").SnackbarCloseReason=} reason The reason why the snackbar is closing.
   */
  const handleClose = (event, reason) => {
    if (reason === 'clickaway')
      return;

    setOpen(false);
  };

  /**
   * The second close action handler.
   * @param {import("react").SyntheticEvent<any> | Event} event The event object.
   * @param {import("@mui/material").SnackbarCloseReason=} reason The reason why the snackbar is closing.
   */
  const handleClose2 = (event, reason) => {
    if (reason === 'clickaway')
      return;

    setOpen2(false);
  };

  useEffect(() => {
    const loadChat = async () => {
      if (interaction?.steps?.find(step => step.type === 'function_call')) {
        try {
          setMessage2('データベースを検索しています．1回の検索につき，15～20秒ほどかかります．');
          /**
           * The results array.
           * @type {Array.<import("@google/genai").Interactions.FunctionResultStep>}
           */
          const results = [];
          for await (const result of execFuncCall(interaction)) {
            if (result)
              results.push(result);
          }
          await asynchronousTimer(timeoutLength);
          const interaction2 = await aimodel.interactions.create({
            model,
            input: results,
            tools,
            previous_interaction_id: interaction?.id,
            generation_config,
          });
          setMessage2('データベースの検索が完了しました！');
          setInteraction(interaction2);
        } catch (e) {
          setMessage(e?.message?.toString() ?? '不明なエラーが発生しました．');
        }
      } else if (interaction?.steps?.find(step => step.type === 'model_output')) {
        setMessage2(`AIによる回答が得られました．AIの回答は誤りを含む可能性があります．また，使用したトークンは${(interaction.usage.total_input_tokens || 0) + (interaction.usage.total_tool_tokens || 0)}です．利用可能なトークンの上限は${maxTokens}です．`);
        /**
         * The markdown output.
         * @type {string}
         */
        const markdown = interaction.output_text;
        setChat(chatMessages => [
          ...chatMessages,
          {
            role: 'model',
            markdown,
          }
        ]);
      }
    };

    loadChat();
  }, [interaction]);

  useEffect(() => {
    const action = async () => {
      setOpen(false);
      if (message)
        setOpen(true);
    };

    action();
  }, [message]);

  useEffect(() => {
    const act = async () => {
      setOpen2(false);
      if (message2)
        setOpen2(true);
    };

    act();
  }, [message2]);

  useEffect(() => {
    const loadFunc = async () => {
      const modelInfo = await aimodel.models.get({
        model,
      });
      console.info(modelInfo);
      if (modelInfo.inputTokenLimit) {
        setMaxTokens(modelInfo.inputTokenLimit);
        setMessage2(`使用中のモデルは${modelInfo.displayName}です．最大使用可能トークンは${modelInfo.inputTokenLimit}です．`);
      }

      if (modelInfo.name === GEMINI_MODEL)
        setTimeoutLength(4000);
      else
        setTimeoutLength(15000);
    };

    loadFunc();
  }, [model]);

  return (
    <>
      <Paper
        sx={{
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: {
            xs: 8,
            sm: 5,
            md: 5,
          },
        }}
      >
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          {chat.map(params => <ChatCard {...params} />)}
        </Stack>
        <Box sx={{
          boxSizing: 'border-box',
          width: '100%',
          position: 'sticky',
          bottom: {
            xs: 120,
            sm: 60,
            md: 60,
          },
          left: 0,
          right: 0,
          zIndex(theme) {
            return theme.zIndex.speedDial - 1;
          },
        }}>
          <PromptEditor
            setMessage={setMessage}
            interaction={interaction}
            setInteraction={setInteraction}
            setChatMessages={setChat}
            setMessage2={setMessage2}
            model={model}
            setModel={setModel}
          />
        </Box>
      </Paper>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        sx={{
          zIndex(theme) {
            return theme.zIndex.appBar + 1;
          },
        }}
      >
        <Alert severity="error" sx={{ width: '100%' }} onClose={handleClose}>{message}</Alert>
      </Snackbar>
      <Snackbar
        open={open2}
        autoHideDuration={5000}
        onClose={handleClose2}
        sx={{
          zIndex(theme) {
            return theme.zIndex.appBar + 1;
          },
        }}
      >
        <Alert severity="info" sx={{ width: '100%' }} onClose={handleClose2}>{message2}</Alert>
      </Snackbar>
    </>
  );
}

export default AIChat;