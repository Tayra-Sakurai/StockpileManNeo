/**
 * @fileoverview The prompt editor of the chat.
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
import { Box, Grid, IconButton } from "@mui/material";
import { FormProvider, SelectElement, TextFieldElement, useForm, useWatch } from "react-hook-form-mui";
import SendIcon from "@mui/icons-material/Send";
import aimodel from "../../aimodules/Gemini.jsx";
import { tools } from "../../aimodules/Functions/DbFunctions.js";
import { generation_config, system_instruction } from "./constants.js";
import { useEffect, useId, useState } from "react";

/**
 * The prompt editor.
 * @param {object} props The props.
 * @param {?import("@google/genai").Interactions.Interaction} props.interaction The interaction.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<?import("@google/genai").Interactions.Interaction>>} props.setInteraction The interaction update setter.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<{role: "model" | "user", markdown: string}[]>>} props.setChatMessages The chat message array.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<string>>} props.setMessage The error message setter.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<string>>} props.setMessage2 The information message setter.
 * @param {string} props.model The generative AI model.
 * @param {import("react").Dispatch.<import("react").SetStateAction.<string>>} props.setModel The model setter.
 * @returns
 */
function PromptEditor({ interaction, setChatMessages, setInteraction, setMessage, setMessage2, model, setModel }) {
  const { reset, handleSubmit, control, setValue, ...otherMethods } = useForm({
    defaultValues: {
      prompt: '',
      model,
    },
  });

  const selectedModel = useWatch({
    control,
    name: 'model',
  });

  useEffect(() => {
    const setter = async () => setModel(selectedModel);
    setter();
  }, [selectedModel, setModel]);

  /**
   * @type {[
   *   import("@google/genai").Model[],
   *   import("react").Dispatch.<import("react").SetStateAction.<import("@google/genai").Model[]>>
   * ]}
   */
  const [models, setModels] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      for await (const availableModel of await aimodel.models.list()) {
        if (availableModel.supportedActions?.includes('generateContent'))
          setModels(mdls => [
            ...mdls,
            availableModel,
          ]);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const action = async () => setValue('model', model);
    action();
  }, [model, setValue]);

  const selectId = useId();

  return (
    <FormProvider reset={reset} handleSubmit={handleSubmit} control={control} setValue={setValue} {...otherMethods}>
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
          reset(({ model }) => ({
            model,
            prompt: '',
          }));
          try {
            const interaction2 = await aimodel.interactions.create({
              system_instruction,
              model,
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
        <Box sx={{ flexGrow: 1 }}>
          <Grid container sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Grid container size={12}>
              <Grid size="grow">
                <TextFieldElement
                  label="プロンプト"
                  name="prompt"
                  placeholder="在庫が少ない名称を教えて．"
                  required
                  multiline
                  fullWidth
                  rows={1}
                  control={control}
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
          </Grid>
          <Grid size={12} container>
            <Grid size={12}>
              <SelectElement
                name="model"
                options={models}
                valueKey="name"
                labelKey="displayName"
                id={selectId}
                label="AIモデル"
                fullWidth
                control={control}
              />
            </Grid>
          </Grid>
        </Box>
      </form>
    </FormProvider>
  );
}

export default PromptEditor;