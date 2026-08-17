import { FormProvider, useForm, useWatch } from "react-hook-form";
import supabase from "../../client.js";
import { useState } from "react";
import { Alert, Button, CircularProgress, Container, FormControl, FormLabel, Stack } from "@mui/material";
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
import BarcodeReader from "../barcode_detection/BarcodeReader.jsx";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import asynchronousTimer from "../../timers/AsynchronousTimer.js";
import SelectLargeLargeCategories from "./selections/SelectLargeLargeCategories.jsx";

/**
 * The item detail editor.
 * @param {object} props The props.
 * @param {number=} props.id The item's id.
 * @returns
 */
function ItemDetail({ id }) {
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const acceptedFormats = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
  ];

  const { control, handleSubmit, setValue, setValues, ...otherMethods } = useForm({
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
          largeLargeCategory: null,
        };

      const { data, error } = await supabase
        .from('items')
        .select('name, description, life, purchase_timestamp, locations!inner(id, name), small_categories!inner(id, name, large_categories!inner(id, name, large_large_categories(id, name))), barcode_data(jan_code)')
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
          useLife: null,
          largeLargeCategory: null,
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
          useLife: data[0].life ? 'Use life' : null,
          largeLargeCategory: data[0].small_categories.large_categories.large_large_categories,
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
        largeLargeCategory: null,
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
      <FormProvider control={control} setValue={setValue} setValues={setValues} handleSubmit={handleSubmit} {...otherMethods}>
        <form
          onSubmit={handleSubmit(async formData => {
            setLoading(true);
            let barcode_id = null;

            // Upsert the barcode data table if needed.
            if (formData.barcode) {
              const { data: d } = await supabase
                .from('barcode_data')
                .select('id')
                .eq('jan_code', formData.barcode);

              if (d?.length) {
                const { data } = await supabase
                  .from('barcode_data')
                  .update({
                    jan_code: formData.barcode,
                    name: formData.name,
                    small_category_id: formData.small_categories?.id,
                  })
                  .eq('id', d[0].id)
                  .select('id');

                if (data?.[0])
                  barcode_id = data[0].id;

                await asynchronousTimer(10);
              } else {
                const { data } = await supabase
                  .from('barcode_data')
                  .insert({
                    jan_code: formData.barcode,
                    name: formData.name,
                    small_category_id: formData.small_categories?.id,
                  })
                  .select('id');

                if (data?.[0])
                  barcode_id = data[0].id;
              }
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
              <FormLabel htmlFor="barcode">JAN コード</FormLabel>
              <TextFieldElement
                id="barcode"
                name="barcode"
                fullWidth
                control={control}
                placeholder="こちらに直接入力することもできます"
              />
            </FormControl>
            <Container>
              <BarcodeReader
                verbose
                formatsToSupport={acceptedFormats}
                useBarCodeDetectorIfSupported={false}
                onSuccess={(decodedText, result) => {
                  setInfo('読み取りに成功しました．');
                  const format = result?.result?.format?.format;
                  if (format === undefined || acceptedFormats.includes(format)) {
                    if (/^\d+$/.exec(decodedText)) {
                      setValue('barcode', decodedText, { shouldValidate: true, shouldDirty: true });
                    } else {
                      setErr('誤検知したようです．');
                    }
                  }
                }}
              />
            </Container>
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
                  .select('id, name, small_categories(id, name, large_categories!inner(id, name, large_large_categories(id, name)))')
                  .eq('jan_code', barcodeText);

                if (data?.[0]) {
                  if (data[0].small_categories) {
                    setValues({
                      small_categories: data[0].small_categories,
                      name: data[0].name,
                    });
                  } else {
                    setValue('name', data[0].name);
                  }
                }
              }}
            >
              バーコード情報を利用して自動入力
            </Button>
            <FormControl>
              <FormLabel htmlFor="largeLargeCategory">大分類</FormLabel>
              <SelectLargeLargeCategories
                id="largeLargeCategory"
                name="largeLargeCategory"
                required
                control={control}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="largeCategory">小分類</FormLabel>
              <SelectLargeCategories
                name="largeCategory"
                id="largeCategory"
                largeLargeCategoryName="largeLargeCategory"
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="small_categories">名称</FormLabel>
              <SelectSmallCategories
                name="small_categories"
                id="small_categories"
                largeCategoryName="largeCategory"
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
              value="Use life"
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
              disabled={loading}
            >
              戻る
            </Button>
            <Button
              color="success"
              variant="contained"
              startIcon={loading ? undefined : <SaveIcon />}
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size="1rem" /> : "保存"}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="error"
              disabled={!id || loading}
              startIcon={<DeleteForeverIcon />}
              onClick={() => setOpen(true)}
            >
              削除
            </Button>
          </Stack>
        </form>
      </FormProvider>
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
