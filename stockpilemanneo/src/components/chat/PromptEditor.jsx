import { Grid, IconButton } from "@mui/material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import SendIcon from "@mui/icons-material/Send";
import aimodel from "../../aimodules/Gemini.jsx";
import { tools } from "../../aimodules/Functions/DbFunctions.js";

/**
 * The prompt editor.
 * @param {object} props The props.
 * @param {?import("@google/genai").Interactions.Interaction} props.interaction The interaction.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<?import("@google/genai").Interactions.Interaction>>} props.setInteraction The interaction update setter.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<{role: "model" | "user", markdown: string}[]>>} props.setChatMessages The chat message array.
 * @returns
 */
function PromptEditor({ interaction, setChatMessages, setInteraction }) {
  return (
    <FormContainer
      defaultValues={{
        prompt: '',
      }}
      onSuccess={async formData => {
        setChatMessages(chatMessages => {
          chatMessages.push({
            role: 'user',
            markdown: formData.prompt,
          });
          return chatMessages;
        });

        const interaction2 = await aimodel.interactions.create({
          model: 'gemini-3-flash-preview',
          input: [
            {
              type: 'user_input',
              content: [
                {
                  type: 'text',
                  text: formData.prompt,
                },
              ],
            },
          ],
          previous_interaction_id: interaction?.id,
          tools,
        });

        setInteraction(interaction2);
      }}
      resetOptions={{
        keepIsSubmitSuccessful: false,
      }}
    >
      <Grid container>
        <Grid size="grow">
          <TextFieldElement
            label="プロンプト"
            name="prompt"
            placeholder="在庫が少ない名称を教えて．"
            fullWidth
            required
            multiline
            rows={1}
          />
        </Grid>
        <Grid size="auto">
          <IconButton
            color="primary"
            aria-label="送信"
            type="submit"
          >
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
    </FormContainer>
  );
}

export default PromptEditor;