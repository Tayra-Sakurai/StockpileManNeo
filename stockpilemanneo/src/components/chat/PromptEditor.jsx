import { Grid, IconButton } from "@mui/material";
import { FormProvider, TextFieldElement, useForm } from "react-hook-form-mui";
import SendIcon from "@mui/icons-material/Send";
import aimodel from "../../aimodules/Gemini.jsx";
import { tools } from "../../aimodules/Functions/DbFunctions.js";
import { GEMINI_MODEL, generation_config, system_instruction } from "./constants.js";

/**
 * The prompt editor.
 * @param {object} props The props.
 * @param {?import("@google/genai").Interactions.Interaction} props.interaction The interaction.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<?import("@google/genai").Interactions.Interaction>>} props.setInteraction The interaction update setter.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<{role: "model" | "user", markdown: string}[]>>} props.setChatMessages The chat message array.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<string>>} props.setMessage The error message setter.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<string>>} props.setMessage2 The information message setter.
 * @returns
 */
function PromptEditor({ interaction, setChatMessages, setInteraction, setMessage, setMessage2 }) {
  const { reset, handleSubmit, ...otherMethods } = useForm({
    defaultValues: {
      prompt: '',
    },
  });

  return (
    <FormProvider reset={reset} handleSubmit={handleSubmit} {...otherMethods}>
      <form
        onSubmit={handleSubmit(async formData => {
          setMessage2('入力内容を送信しました．回答が得られるまでしばらくお待ちください．');
          setChatMessages(chatMessages => [
            ...chatMessages,
            {
              role: 'user',
              markdown: formData.prompt,
            },
          ]);
          reset();
          try {
            const interaction2 = await aimodel.interactions.create({
              system_instruction,
              model: GEMINI_MODEL,
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
              generation_config,
            });

            setInteraction(interaction2);
          } catch (e) {
            setMessage(e?.toString() ?? 'An unknown error occurred.');
          }
        })}
      >
        <Grid container sx={{ width: '100%', boxSizing: 'border-box' }}>
          <Grid size="grow">
            <TextFieldElement
              label="プロンプト"
              name="prompt"
              placeholder="在庫が少ない名称を教えて．"
              required
              multiline
              fullWidth
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
      </form>
    </FormProvider>
  );
}

export default PromptEditor;