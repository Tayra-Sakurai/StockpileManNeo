import { useForm, useWatch } from "react-hook-form";
import supabase from "../../client.js";
import { useState } from "react";
import { Alert, Button, FormControl, FormLabel, Stack } from "@mui/material";
import { createEmbeddingVector } from "../stockpile/stockpileVectors.js";
import { useNavigate } from "react-router-dom";
import { SwitchElement, TextFieldElement } from "react-hook-form-mui";
import SelectLargeCategories from "./selections/SelectLargeCategories.jsx";
import TaskIcon from "@mui/icons-material/Task";
import SelectSmallCategories from "./selections/SelectSmallCategories.jsx";
import SelectLocations from "./selections/SelectLocations.jsx";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveConfirmDialog from "./dialogs/RemoveConfirmDialog.jsx";
import getBarcode from "../../detectors/getBarcode.js";

/**
 * The item detail editor.
 * @param {object} props The props.
 * @param {number} props.id The item's id.
 * @returns
 */
function ItemDetail({ id }) {
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  /**
   * @type {[
   *   ?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate,
   *   import("react").Dispatch.<import("react").SetStateAction.<?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate>>
   * ]}
   */
  const [largeCategory, setLargeCategory] = useState(null);

  /**
   * File processing function.
   * @param {File} file
   */
  const autoFillFunc = async file => {
    const result = await getBarcode(file);

    if (!result || /\D/.exec(result)) {
      setErr(result);
      return;
    }

    const { data } = await supabase
      .from('barcode_data')
      .select('name')
      .eq('jan_code', result);

    if (data?.[0]) setValues({
      barcode: result,
      name: data[0].name,
    });
  };

  const { control, handleSubmit, setValue, setValues } = useForm({
    async defaultValues() {
      if (!id)
        // Returns empty table.
        return {
          barcode: '',
          name: '',
          description: '',
          life: '',
          purchase_date: new Date().toISOString().replace(/T.*$/, ''),
          small_categories: null,
          largeCategory: null,
          locations: null,
          useLife: null,
        };

      const { data, error } = await supabase
        .from('items')
        .select('name, description, life, purchase_timestamp, locations!inner(id, name), small_categories!inner(id, name, large_categories!inner(id, name)), barcode_data(jan_code)')
        .eq('id', id);

      if (error) {
        // Returns the empty form.
        setErr(error.message);
        return {
          barcode: '',
          name: '',
          description: '',
          life: '',
          purchase_date: new Date().toISOString().replace(/T.*$/, ''),
          small_categories: null,
          largeCategory: null,
          locations: null,
          useLife: null
        };
      }

      if (data[0]) {
        return {
          name: data[0].name,
          description: data[0].description,
          barcode: data[0].barcode_data?.jan_code,
          life: data[0].life ? data[0].life.replace(/T.*$/, '') : '',
          purchase_date: data[0].purchase_timestamp.replace(/T.*$/, ''),
          small_categories: data[0].small_categories,
          largeCategory: data[0].small_categories.large_categories,
          locations: data[0].locations,
          useLife: 'Use life',
        };
      }

      return {
        barcode: '',
        name: '',
        description: '',
        life: '',
        purchase_date: new Date().toISOString().replace(/T.*$/, ''),
        small_categories: null,
        largeCategory: null,
        locations: null,
        useLife: null,
      };
    },
  });

  const [barcodeText, lifeSw] = useWatch({
    control,
    name: ['barcode', 'useLife'],
  });

  return (
    <>
      {err ? <Alert severity="error">{err}</Alert> : null}
      {info ? <Alert severity="info">{info}</Alert> : null}
      <form
        onSubmit={handleSubmit(async formData => {
          let barcode_id = null;

          // Upsert the barcode data table if needed.
          if (formData.barcode) {
            const { data } = await supabase
              .from('barcode_data')
              .upsert({
                jan_code: formData.barcode,
                name: formData.name,
              }, {
                onConflict: 'jan_code',
              })
              .select('id');

            if (data?.[0]) barcode_id = data[0].id;
          }

          if (id)
            await supabase
              .from('items')
              .update({
                name: formData.name,
                barcode_id,
                description: formData.description,
                small_category_id: formData.small_categories?.id,
                location_id: formData.locations?.id,
                life: formData.life ? new Date(formData.life).toISOString() : null,
                purchase_timestamp: new Date(formData.purchase_date).toISOString(),
                vector: await createEmbeddingVector(formData.name),
              })
              .eq('id', id);
          else
            await supabase
              .from('items')
              .insert({
                vector: await createEmbeddingVector(formData.name),
                name: formData.name,
                description: formData.description,
                small_category_id: formData.small_categories?.id ?? 0,
                location_id: formData.locations?.id ?? 0,
                life: formData.life ? new Date(formData.life).toISOString() : null,
                purchase_timestamp: new Date(formData.purchase_date).toISOString(),
                barcode_id,
              });

          navigate(-1);
        })}
      >
        <Stack spacing={2}>
          <FormControl>
            <FormLabel htmlFor="barcode">バーコード画像をアップロード</FormLabel>
            <TextFieldElement
              name="barcode"
              fullWidth
              control={control}
              placeholder="こちらに直接入力することもできます"
            />
            <input
              id="barcode"
              type="file"
              style={{ display: 'none' }}
              onChange={async event => {
                if (event.currentTarget.files?.[0]) {
                  setValue('barcode', '');
                  setInfo('バーコードの読み取りが開始されました．');
                  await autoFillFunc(event.currentTarget.files[0]);
                }
              }}
            />
          </FormControl>
          <Button
            type="button"
            variant="contained"
            color="secondary"
            startIcon={<TaskIcon />}
            onClick={async () => {
              if (!barcodeText)
                return;

              const { data } = await supabase
                .from('barcode_data')
                .select('id, name')
                .eq('jan_code', barcodeText);

              if (data?.[0]) {
                setValue('name', data[0].name);
              }
            }}
          >
            バーコード情報を利用して自動入力
          </Button>
          <FormControl>
            <FormLabel htmlFor="largeCategory">分類</FormLabel>
            <SelectLargeCategories
              name="largeCategory"
              id="largeCategory"
              value={largeCategory}
              setValue={setLargeCategory}
              control={control}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="small_categories">名称</FormLabel>
            <SelectSmallCategories
              name="small_categories"
              id="small_categories"
              largeCategory={largeCategory}
              setLargeCategory={setLargeCategory}
              control={control}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="locations">保管場所</FormLabel>
            <SelectLocations
              name="locations"
              id="locations"
              control={control}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="name">商品名</FormLabel>
            <TextFieldElement
              control={control}
              name="name"
              id="name"
              required
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="purchase_date">購入日</FormLabel>
            <TextFieldElement
              type="date"
              required
              name="purchase_date"
              id="purchase_date"
              control={control}
              fullWidth
            />
          </FormControl>
          <SwitchElement
            name="useLife"
            label="期限を設定する．"
            control={control}
          />
          <FormControl>
            <FormLabel htmlFor="life">期限</FormLabel>
            <TextFieldElement
              id="life"
              name="life"
              disabled={!lifeSw}
              fullWidth
              type="date"
              control={control}
            />
          </FormControl>
          <Button
            color="primary"
            variant="contained"
            startIcon={<UndoIcon />}
            type="button"
            onClick={() => navigate(-1)}
          >
            戻る
          </Button>
          <Button
            color="success"
            variant="contained"
            startIcon={<SaveIcon />}
            type="submit"
          >
            保存
          </Button>
          <Button
            type="button"
            variant="contained"
            color="error"
            disabled={!id}
            startIcon={<DeleteForeverIcon />}
            onClick={() => setOpen(true)}
          >
            削除
          </Button>
        </Stack>
      </form>
      <RemoveConfirmDialog
        open={open}
        setOpen={setOpen}
        callback={async () => {
          if (id) {
            await supabase
              .from('items')
              .delete()
              .eq('id', id);
            navigate(-1);
          }
        }}
      />
    </>
  );
}

export default ItemDetail;