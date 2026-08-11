import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import supabase from "../../client.js";
import { useNavigate } from "react-router-dom";
import { createEmbeddingVector } from "../stockpile/stockpileVectors.js";
import { Alert, AlertTitle, Button, FormControl, FormLabel, Link, Stack } from "@mui/material";
import SelectSmallCategories from "./selections/SelectSmallCategories.jsx";
import SelectLocations from "./selections/SelectLocations.jsx";
import UndoIcon from '@mui/icons-material/Undo';
import SaveIcon from '@mui/icons-material/Save';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from "react";
import RemoveConfirmDialog from "./dialogs/RemoveConfirmDialog.jsx";
import SelectLargeCategories from "./selections/SelectLargeCategories.jsx";

/**
 * The form value format.
 * @typedef {object} ItemFormData
 * @property {string} name The name of the item.
 * @property {?string} description The description of the item.
 * @property {?string} life The life of the item.
 * @property {string} purchase_timestamp The timestamp of the purchased date.
 * @property {import("./selections/SelectSmallCategories.jsx").SmallCategoryCandidate} small_categories The small category.
 * @property {import("./selections/SelectLocations.jsx").LocationCandidate} locations The location.
 * @property {?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate} largeCategory The large category.
 */

/**
 * The item editor.
 * @param {object} props The props.
 * @param {number=} props.id The ID.
 * @returns
 */
function ItemDetail({ id }) {
  const [open, setOpen] = useState(false);
  /**
   * @type {[
   *   ?import("react").JSX.Element,
   *   import("react").Dispatch.<import("react").SetStateAction.<?import("react").JSX.Element>>
   * ]}
   */
  const [errorAlert, setErrorAlert] = useState(null);
  const navigate = useNavigate();

  /**
   * @type {[
   *   ?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate,
   *   import("react").Dispatch.<import("react").SetStateAction.<?import("./selections/SelectLargeCategories.jsx").LargeCategoryCandidate>>
   * ]}
   */
  const [largeCategory, setLargeCategory] = useState(null);

  return (
    <>
      <FormContainer
        defaultValues={async () => {
          if (id) {
            const { data } = await supabase
              .from('items')
              .select('name, description, life, purchase_timestamp, small_categories(id, name, large_categories(id, name)), locations(id, name)')
              .eq('id', id);

            if (data) {
              const values = data[0];

              /**
               * @type {ItemFormData}
               */
              const result = {
                name: values.name,
                description: values.description,
                life: (values.life ? new Date(values.life).toISOString().replace(/T.*$/, '') : null),
                purchase_timestamp: new Date(values.purchase_timestamp).toISOString().replace(/T.*$/, ''),
                small_categories: values.small_categories,
                locations: values.locations,
                largeCategory: values.small_categories.large_categories,
              };

              return result;
            }
          }

          const { data: d, error } = await supabase
            .from('small_categories')
            .select('id, name, large_categories(id, name)');

          if (error) throw error;
          if (!d) throw new Error('An unknown error occurred');

          const { data: d2, error: err } = await supabase
            .from('locations')
            .select('id, name');

          if (err) throw err;
          if (!d2) throw new Error('An unknown database error occurred.');

          return {
            name: '',
            description: '',
            life: null,
            purchase_timestamp: new Date().toISOString().replace(/T.*$/, ''),
            small_categories: d[0],
            locations: d2[0],
            largeCategory: d[0].large_categories,
          };
        }}
        onSuccess={async ({ name, description, life, purchase_timestamp, small_categories, locations }) => {
          try {
            /** @type{number=} */
            let smallCategoryId;

            if (!small_categories.id) {
              if (!small_categories.large_categories.id)
                throw new TypeError('Invalid type of small category');

              const { data, error } = await supabase
                .from('small_categories')
                .insert({
                  large_category_id: small_categories.large_categories.id,
                  name: small_categories.name,
                  vector: await createEmbeddingVector(small_categories.name),
                })
                .select('id');

              if (error) throw error;

              if (!data) throw new Error('An unknown database error occurred.');

              smallCategoryId = data[0].id;
            }

            if (id) {
              await supabase
                .from('items')
                .update({
                  name,
                  description,
                  life: (life ? new Date(life).toISOString() : null),
                  purchase_timestamp: new Date(purchase_timestamp).toISOString(),
                  small_category_id: small_categories.id ?? smallCategoryId,
                  location_id: locations.id,
                })
                .eq('id', id);
              navigate(-1);
            } else {
              if (!locations.id || !(small_categories.id ?? smallCategoryId))
                throw new Error('The parameter is not valid');

              await supabase
                .from('items')
                .insert({
                  name,
                  description,
                  life: (life ? new Date(life).toISOString() : null),
                  purchase_timestamp: new Date(purchase_timestamp).toISOString(),
                  small_category_id: small_categories.id ?? smallCategoryId,
                  location_id: locations.id,
                });

              navigate(-1);
            }
          } catch (err) {
            console.error(err);
            setErrorAlert(
              (
                <Alert severity="error">
                  <AlertTitle>エラーが発生しました</AlertTitle>
                  データベースの処理に失敗しました．<Link href="https://github.com/Tayra-Sakurai/StockpileManNeo/issues">GitHub</Link>にてお知らせください．
                </Alert>
              )
            );
          }
        }}
      >
        <Stack
          direction="column"
          spacing={4}
        >
          {errorAlert}
          <FormControl>
            <FormLabel htmlFor="largeCategory">分類</FormLabel>
            <SelectLargeCategories
              name="largeCategory"
              id="largeCategory"
              setValue={setLargeCategory}
              value={largeCategory}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="small_categories">名称</FormLabel>
            <SelectSmallCategories
              id="small_categories"
              name="small_categories"
              largeCategory={largeCategory}
              setLargeCategory={setLargeCategory}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="locations">保管場所</FormLabel>
            <SelectLocations
              name="locations"
              id="locations"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="name">商品名</FormLabel>
            <TextFieldElement
              id="name"
              name="name"
              required
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="purchase_timestamp">購入日</FormLabel>
            <TextFieldElement
              type="date"
              name="purchase_timestamp"
              required
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="life">使用期限・賞味期限など</FormLabel>
            <TextFieldElement
              type="date"
              name="life"
              id="life"
              fullWidth
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="notes">備考</FormLabel>
            <TextFieldElement
              id="notes"
              name="description"
              fullWidth
              multiline
              rows={2}
            />
          </FormControl>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
          >
            <Button
              color="primary"
              variant="text"
              startIcon={<UndoIcon />}
              type="button"
              onClick={() => navigate(-1)}
            >
              戻る
            </Button>
            <Button
              color="success"
              startIcon={<SaveIcon />}
              type="submit"
              variant="contained"
            >
              保存
            </Button>
            <Button
              color="error"
              startIcon={<DeleteForeverIcon />}
              type="button"
              onClick={() => setOpen(v => !v)}
              disabled={!id}
              variant="contained"
            >
              削除
            </Button>
          </Stack>
        </Stack>
      </FormContainer>
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