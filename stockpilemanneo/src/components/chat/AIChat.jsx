import { Alert, Box, Paper, Snackbar, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ChatCard from "./ChatCard.jsx";
import PromptEditor from "./PromptEditor.jsx";
import { execFuncCall, tools } from "../../aimodules/Functions/DbFunctions.js";
import aimodel from "../../aimodules/Gemini.jsx";
import asynchronousTimer from "../../timers/AsynchronousTimer.js";
import { GEMINI_MODEL } from "./constants.js";

function AIChat() {
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

  /**
   * The close action handler.
   * @param {import("react").SyntheticEvent<any> | Event} event The event object.
   * @param {import("@mui/material").SnackbarCloseReason} reason The reason why the snackbar is closing.
   */
  const handleClose = (event, reason) => {
    if (reason === 'clickaway')
      return;

    setOpen(false);
  };

  /**
   * The second close action handler.
   * @param {import("react").SyntheticEvent<any> | Event} event The event object.
   * @param {import("@mui/material").SnackbarCloseReason} reason The reason why the snackbar is closing.
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
          setMessage2('Calling function...');
          /**
           * The results array.
           * @type {Array.<import("@google/genai").Interactions.FunctionResultStep>}
           */
          const results = [];
          for await (const result of execFuncCall(interaction)) {
            if (result)
              results.push(result);
          }
          await asynchronousTimer(20000);
          const interaction2 = await aimodel.interactions.create({
            model: GEMINI_MODEL,
            input: results,
            tools,
            previous_interaction_id: interaction?.id,
          });
          setMessage2('Called the function!');
          setInteraction(interaction2);
        } catch (e) {
          setMessage(e?.message?.toString() ?? '不明なエラーが発生しました．');
        }
      } else if (interaction?.steps?.find(step => step.type === 'model_output')) {
        setMessage2('Program has gotten a response.');
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
    setOpen(true);
  }, [message]);

  useEffect(() => setOpen2(true), [message2]);

  return (
    <>
      <Paper
        sx={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          overflow: 'scroll',
        }}
      >
        <Stack spacing={2}>
          {chat.map(params => <ChatCard {...params} />)}
        </Stack>
        <Box sx={{ boxSizing: 'border-box', width: '100%', position: 'sticky', bottom: 0, left: 0, right: 0 }}>
          <PromptEditor setMessage={setMessage} interaction={interaction} setInteraction={setInteraction} setChatMessages={setChat} />
        </Box>
      </Paper>
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert severity="error">{message}</Alert>
      </Snackbar>
      <Snackbar open={open2} autoHideDuration={5000} onClose={handleClose2}>
        <Alert severity="info">{message2}</Alert>
      </Snackbar>
    </>
  );
}

export default AIChat;