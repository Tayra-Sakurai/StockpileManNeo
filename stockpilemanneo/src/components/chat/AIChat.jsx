import { Box, Paper, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ChatCard from "./ChatCard.jsx";
import PromptEditor from "./PromptEditor.jsx";
import { execFuncCall, tools } from "../../aimodules/Functions/DbFunctions.js";
import aimodel from "../../aimodules/Gemini.jsx";

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

  useEffect(() => {
    const loadChat = async () => {
      if (interaction?.steps?.find(step => step.type === 'finction_call')) {
        const result = await execFuncCall(interaction);
        const interaction2 = await aimodel.interactions.create({
          model: 'gemini-3-flash-preview',
          input: [result],
          tools,
          previous_interaction_id: interaction?.id,
        });
        setInteraction(interaction2);
      } else if (interaction?.steps?.find(step => step.type === 'model_output')) {
        /**
         * The markdown output.
         * @type {string}
         */
        const markdown = interaction.output_text;
        setChat(chat => {
          chat.push({
            role: 'model',
            markdown,
          });
          return chat;
        });
      }
    };

    loadChat();
  }, [interaction])

  return (
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
        <PromptEditor interaction={interaction} setInteraction={setInteraction} setChatMessages={setChat} />
      </Box>
    </Paper>
  );
}

export default AIChat;