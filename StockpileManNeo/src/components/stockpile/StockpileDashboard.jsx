import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PlaceIcon from '@mui/icons-material/Place';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import supabase from '../../client.js';
import ItemDetail from '../datafield/ItemDetail.jsx';
import LocationDetail from '../datafield/LocationDetail.jsx';
import SmallCategoryDetail from '../datafield/SmallCategoryDetail.jsx';
import { createEmbeddingVector, toScalarVector } from './stockpileVectors.js';

const views = [
  { value: 'overview', label: '概要' },
  { value: 'items', label: '在庫' },
  { value: 'taxonomy', label: '分類' },
  { value: 'locations', label: '保管場所' },
];

const emptyLargeCategory = { name: '' };
const emptySmallCategory = { name: '', large_category_id: '' };
const emptyLocation = { name: '' };

function toDateTimeLocalValue(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function createEmptyItem() {
  return {
    name: '',
    small_category_id: '',
    location_id: '',
    purchase_timestamp: toDateTimeLocalValue(),
    life: '',
    description: '',
  };
}

function toIsoDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatDate(value) {
  if (!value) {
    return '未設定';
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getItemStatus(item) {
  if (!item.life) {
    return { label: '期限なし', color: 'default' };
  }

  const now = Date.now();
  const lifeTime = new Date(item.life).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (lifeTime < now) {
    return { label: '期限切れ', color: 'error' };
  }

  if (lifeTime - now <= sevenDays) {
    return { label: 'まもなく', color: 'warning' };
  }

  return { label: '保管中', color: 'success' };
}

function getCategoryName(item) {
  const small = item.small_categories;
  const large = small?.large_categories;
  return [large?.name, small?.name].filter(Boolean).join(' / ') || '未分類';
}

function Metric({ icon, label, value, caption }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        minHeight: 112,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Box>
        <Typography variant="h4" component="p">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      </Box>
    </Paper>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        minHeight: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Stack spacing={1} alignItems="center">
        {icon}
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {message}
        </Typography>
      </Stack>
    </Paper>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}

export default function StockpileDashboard() {
  const navigate = useNavigate();
  const [sessionLoading, setSessionLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [snackbar, setSnackbar] = React.useState('');
  const [view, setView] = React.useState('overview');
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [largeCategories, setLargeCategories] = React.useState([]);
  const [smallCategories, setSmallCategories] = React.useState([]);
  const [locations, setLocations] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [largeForm, setLargeForm] = React.useState(emptyLargeCategory);
  const [smallForm, setSmallForm] = React.useState(emptySmallCategory);
  const [locationForm, setLocationForm] = React.useState(emptyLocation);
  const [itemForm, setItemForm] = React.useState(createEmptyItem);
  const [editTarget, setEditTarget] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});
  const [detailTarget, setDetailTarget] = React.useState(null);

  const loadInventory = React.useCallback(async () => {
    setLoading(true);
    setError('');

    const [largeResult, smallResult, locationResult, itemResult] = await Promise.all([
      supabase.from('large_categories').select('*').order('name', { ascending: true }),
      supabase
        .from('small_categories')
        .select('*, large_categories(id, name)')
        .order('name', { ascending: true }),
      supabase.from('locations').select('*').order('name', { ascending: true }),
      supabase
        .from('items')
        .select(
          '*, locations(id, name), small_categories(id, name, large_category_id, large_categories(id, name))',
        )
        .order('life', { ascending: true, nullsFirst: false }),
    ]);

    const failure = [largeResult, smallResult, locationResult, itemResult].find(
      (result) => result.error,
    );

    if (failure?.error) {
      setError(failure.error.message);
    } else {
      setLargeCategories(largeResult.data ?? []);
      setSmallCategories(smallResult.data ?? []);
      setLocations(locationResult.data ?? []);
      setItems(itemResult.data ?? []);
    }

    setLoading(false);
  }, []);

  React.useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      if (sessionError || !data?.session) {
        navigate('/signin');
        return;
      }

      setSessionLoading(false);
      loadInventory();
    }

    checkSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/signin');
      }
    });

    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [loadInventory, navigate]);

  React.useEffect(() => {
    const changeView = (event) => {
      if (views.some((tab) => tab.value === event.detail)) {
        setView(event.detail);
      }
    };

    window.addEventListener('stockpile-view-change', changeView);
    return () => window.removeEventListener('stockpile-view-change', changeView);
  }, []);

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const smallCategoryId = String(item.small_category_id);
      const categoryMatches = !categoryFilter || smallCategoryId === categoryFilter;
      const searchable = [
        item.name,
        item.description,
        item.locations?.name,
        item.small_categories?.name,
        item.small_categories?.large_categories?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return categoryMatches && (!query || searchable.includes(query));
    });
  }, [categoryFilter, items, search]);

  const expiringItems = React.useMemo(() => {
    return items
      .filter((item) => ['error', 'warning'].includes(getItemStatus(item).color))
      .slice(0, 6);
  }, [items]);

  const runMutation = async (action, successMessage) => {
    setSaving(true);
    setError('');

    try {
      const result = await action();
      if (result?.error) {
        throw result.error;
      }

      setSnackbar(successMessage);
      await loadInventory();
    } catch (mutationError) {
      setError(mutationError?.message || '保存中にエラーが発生しました。');
    } finally {
      setSaving(false);
    }
  };

  const createLargeCategory = async (event) => {
    event.preventDefault();
    const name = largeForm.name.trim();
    if (!name) {
      return;
    }

    await runMutation(async () => {
      const vector = await createEmbeddingVector(name);
      return supabase.from('large_categories').insert({
        name,
        vector: toScalarVector(vector),
      });
    }, '大カテゴリを追加しました。');

    setLargeForm(emptyLargeCategory);
  };

  const createSmallCategory = async (event) => {
    event.preventDefault();
    const name = smallForm.name.trim();
    if (!name || !smallForm.large_category_id) {
      return;
    }

    await runMutation(async () => {
      const largeName =
        largeCategories.find((category) => String(category.id) === smallForm.large_category_id)
          ?.name ?? '';
      const vector = await createEmbeddingVector(`${largeName} ${name}`);
      return supabase.from('small_categories').insert({
        name,
        large_category_id: Number(smallForm.large_category_id),
        vector: toScalarVector(vector),
      });
    }, '小カテゴリを追加しました。');

    setSmallForm(emptySmallCategory);
  };

  const createLocation = async (event) => {
    event.preventDefault();
    const name = locationForm.name.trim();
    if (!name) {
      return;
    }

    await runMutation(async () => {
      const vector = await createEmbeddingVector(name);
      return supabase.from('locations').insert({ name, vector });
    }, '保管場所を追加しました。');

    setLocationForm(emptyLocation);
  };

  const createItem = async (event) => {
    event.preventDefault();
    const name = itemForm.name.trim();
    if (!name || !itemForm.small_category_id || !itemForm.location_id) {
      return;
    }

    await runMutation(async () => {
      const vector = await createEmbeddingVector(`${name} ${itemForm.description}`);
      return supabase.from('items').insert({
        name,
        small_category_id: Number(itemForm.small_category_id),
        location_id: Number(itemForm.location_id),
        purchase_timestamp: toIsoDateTime(itemForm.purchase_timestamp) ?? new Date().toISOString(),
        life: toIsoDateTime(itemForm.life),
        description: itemForm.description.trim() || null,
        vector,
      });
    }, '在庫アイテムを追加しました。');

    setItemForm(createEmptyItem());
  };

  const deleteRecord = async (table, id, label) => {
    if (!window.confirm(`${label}を削除しますか？`)) {
      return;
    }

    await runMutation(
      () => supabase.from(table).delete().eq('id', id),
      `${label}を削除しました。`,
    );
  };

  const openEdit = (type, record) => {
    setEditTarget({ type, record });

    if (type === 'large') {
      setEditForm({ name: record.name });
    } else if (type === 'small') {
      setEditForm({
        name: record.name,
        large_category_id: String(record.large_category_id),
      });
    } else if (type === 'location') {
      setEditForm({ name: record.name });
    } else {
      setEditForm({
        name: record.name,
        small_category_id: String(record.small_category_id),
        location_id: String(record.location_id),
        purchase_timestamp: toDateTimeLocalValue(record.purchase_timestamp),
        life: record.life ? toDateTimeLocalValue(record.life) : '',
        description: record.description ?? '',
      });
    }
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm({});
  };

  const openDetail = (type, record) => setDetailTarget({ type, record });

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editTarget) {
      return;
    }

    const { type, record } = editTarget;
    const name = editForm.name?.trim();
    if (!name) {
      return;
    }

    await runMutation(async () => {
      if (type === 'large') {
        const vector = await createEmbeddingVector(name);
        return supabase
          .from('large_categories')
          .update({ name, vector: toScalarVector(vector) })
          .eq('id', record.id);
      }

      if (type === 'small') {
        const largeName =
          largeCategories.find((category) => String(category.id) === editForm.large_category_id)
            ?.name ?? '';
        const vector = await createEmbeddingVector(`${largeName} ${name}`);
        return supabase
          .from('small_categories')
          .update({
            name,
            large_category_id: Number(editForm.large_category_id),
            vector: toScalarVector(vector),
          })
          .eq('id', record.id);
      }

      if (type === 'location') {
        const vector = await createEmbeddingVector(name);
        return supabase.from('locations').update({ name, vector }).eq('id', record.id);
      }

      const vector = await createEmbeddingVector(`${name} ${editForm.description ?? ''}`);
      return supabase
        .from('items')
        .update({
          name,
          small_category_id: Number(editForm.small_category_id),
          location_id: Number(editForm.location_id),
          purchase_timestamp: toIsoDateTime(editForm.purchase_timestamp) ?? new Date().toISOString(),
          life: toIsoDateTime(editForm.life),
          description: editForm.description?.trim() || null,
          vector,
        })
        .eq('id', record.id);
    }, '変更を保存しました。');

    closeEdit();
  };

  if (sessionLoading) {
    return (
      <Box sx={{ py: 12, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const itemCountByLocation = locations.map((location) => ({
    ...location,
    count: items.filter((item) => item.location_id === location.id).length,
  }));

  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 128px)',
        bgcolor: 'background.default',
        px: { xs: 2, md: 4 },
        py: 3,
        textAlign: 'left',
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" component="h1">
              ホーム在庫
            </Typography>
            <Typography variant="body1" color="text.secondary">
              家にあるストック、保管場所、期限をまとめて管理します。
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="再読み込み">
              <span>
                <IconButton onClick={loadInventory} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setView('items')}
            >
              在庫を追加
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Tabs
          value={view}
          onChange={(_event, value) => setView(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {views.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>

        {view === 'overview' ? (
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <Metric
                icon={<Inventory2Icon color="primary" />}
                label="在庫数"
                value={items.length}
                caption="登録済みアイテム"
              />
              <Metric
                icon={<WarningAmberIcon color="warning" />}
                label="期限注意"
                value={expiringItems.length}
                caption="期限切れ、または7日以内"
              />
              <Metric
                icon={<CategoryIcon color="primary" />}
                label="分類"
                value={`${largeCategories.length} / ${smallCategories.length}`}
                caption="大カテゴリ / 小カテゴリ"
              />
              <Metric
                icon={<PlaceIcon color="primary" />}
                label="保管場所"
                value={locations.length}
                caption="棚、箱、部屋など"
              />
            </Box>

            <SectionTitle
              title="期限の近い在庫"
              subtitle="使う、移動する、買い足す判断が必要なものです。"
            />
            {expiringItems.length ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>名前</TableCell>
                      <TableCell>分類</TableCell>
                      <TableCell>場所</TableCell>
                      <TableCell>期限</TableCell>
                      <TableCell>状態</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiringItems.map((item) => {
                      const status = getItemStatus(item);
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{getCategoryName(item)}</TableCell>
                          <TableCell>{item.locations?.name ?? '未設定'}</TableCell>
                          <TableCell>{formatDate(item.life)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={status.label} color={status.color} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState
                icon={<Inventory2Icon color="primary" fontSize="large" />}
                title="期限注意の在庫はありません"
                message="期限を入力した在庫はここに出ます。買い置き食品や消耗品の見落としを減らせます。"
              />
            )}
          </Stack>
        ) : null}

        {view === 'items' ? (
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <SectionTitle title="在庫を追加" subtitle="品名、分類、保管場所、期限を登録します。" />
                <Box component="form" onSubmit={createItem}>
                  <ItemDetail
                    value={itemForm}
                    smallCategories={smallCategories}
                    locations={locations}
                    onChange={setItemForm}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={16} /> : <AddIcon />}
                      disabled={saving || !smallCategories.length || !locations.length}
                    >
                      追加
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <SectionTitle title="在庫一覧" subtitle="検索、期限確認、編集、削除ができます。" />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="検索"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="小カテゴリ"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                sx={{ minWidth: { md: 260 } }}
              >
                <MenuItem value="">すべて</MenuItem>
                {smallCategories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {filteredItems.length ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>品名</TableCell>
                      <TableCell>分類</TableCell>
                      <TableCell>場所</TableCell>
                      <TableCell>購入日</TableCell>
                      <TableCell>期限</TableCell>
                      <TableCell>状態</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const status = getItemStatus(item);
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">{item.name}</Typography>
                            {item.description ? (
                              <Typography variant="caption" color="text.secondary">
                                {item.description}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>{getCategoryName(item)}</TableCell>
                          <TableCell>{item.locations?.name ?? '未設定'}</TableCell>
                          <TableCell>{formatDate(item.purchase_timestamp)}</TableCell>
                          <TableCell>{formatDate(item.life)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={status.label} color={status.color} />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="詳細">
                              <IconButton onClick={() => openDetail('item', item)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="編集">
                              <IconButton onClick={() => openEdit('item', item)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="削除">
                              <IconButton
                                color="error"
                                onClick={() => deleteRecord('items', item.id, item.name)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState
                icon={<SearchIcon color="primary" fontSize="large" />}
                title="在庫が見つかりません"
                message="検索条件を変えるか、分類と保管場所を作成してから在庫を追加してください。"
              />
            )}
          </Stack>
        ) : null}

        {view === 'taxonomy' ? (
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Card variant="outlined">
                <CardContent>
                  <SectionTitle title="大カテゴリ" subtitle="食品、日用品、防災などの上位分類です。" />
                  <Box component="form" onSubmit={createLargeCategory}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <TextField
                        label="大カテゴリ名"
                        value={largeForm.name}
                        onChange={(event) => setLargeForm({ name: event.target.value })}
                        required
                        fullWidth
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled={saving}
                      >
                        追加
                      </Button>
                    </Stack>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    {largeCategories.map((category) => (
                      <Paper
                        key={category.id}
                        variant="outlined"
                        sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <CategoryIcon color="primary" />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2">{category.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {
                              smallCategories.filter(
                                (smallCategory) =>
                                  smallCategory.large_category_id === category.id,
                              ).length
                            }
                            件の小カテゴリ
                          </Typography>
                        </Box>
                        <IconButton onClick={() => openEdit('large', category)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            deleteRecord('large_categories', category.id, category.name)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <SectionTitle title="小カテゴリ" subtitle="米、電池、洗剤などの品目名です。" />
                  <Box component="form" onSubmit={createSmallCategory}>
                    <Stack spacing={1.5}>
                      <SmallCategoryDetail
                        value={smallForm}
                        largeCategories={largeCategories}
                        onChange={setSmallForm}
                      />
                      <Stack direction="row" justifyContent="flex-end">
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<AddIcon />}
                          disabled={saving || !largeCategories.length}
                        >
                          追加
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    {smallCategories.map((category) => (
                      <Paper
                        key={category.id}
                        variant="outlined"
                        sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Inventory2Icon color="primary" />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2">{category.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.large_categories?.name ?? '大カテゴリ未設定'}
                          </Typography>
                        </Box>
                        <Tooltip title="詳細">
                          <IconButton onClick={() => openDetail('small', category)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton onClick={() => openEdit('small', category)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            deleteRecord('small_categories', category.id, category.name)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        ) : null}

        {view === 'locations' ? (
          <Stack spacing={3}>
            <Card variant="outlined">
              <CardContent>
                <SectionTitle title="保管場所を追加" subtitle="キッチン棚、玄関収納、非常用箱など。" />
                <Box component="form" onSubmit={createLocation}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LocationDetail value={locationForm} onChange={setLocationForm} />
                    </Box>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled={saving}
                    >
                      追加
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <SectionTitle title="保管場所一覧" subtitle="場所ごとの在庫数を確認できます。" />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {itemCountByLocation.map((location) => (
                <Card key={location.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <PlaceIcon color="primary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{location.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {location.count}件の在庫
                        </Typography>
                      </Box>
                      <Tooltip title="詳細">
                        <IconButton onClick={() => openDetail('location', location)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton onClick={() => openEdit('location', location)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => deleteRecord('locations', location.id, location.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Stack>
        ) : null}
      </Stack>

      <Dialog open={Boolean(editTarget)} onClose={closeEdit} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveEdit}>
          <DialogTitle>編集</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {editTarget?.type === 'large' ? (
                <TextField
                  label="大カテゴリ名"
                  value={editForm.name ?? ''}
                  onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  fullWidth
                />
              ) : null}
              {editTarget?.type === 'small' ? (
                <SmallCategoryDetail
                  value={editForm}
                  largeCategories={largeCategories}
                  onChange={setEditForm}
                />
              ) : null}
              {editTarget?.type === 'location' ? (
                <LocationDetail value={editForm} onChange={setEditForm} />
              ) : null}
              {editTarget?.type === 'item' ? (
                <ItemDetail
                  value={editForm}
                  smallCategories={smallCategories}
                  locations={locations}
                  onChange={setEditForm}
                />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEdit}>キャンセル</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              保存
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>詳細</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {detailTarget?.type === 'item' ? (
              <ItemDetail
                value={detailTarget.record}
                smallCategories={smallCategories}
                locations={locations}
                readOnly
              />
            ) : null}
            {detailTarget?.type === 'small' ? (
              <SmallCategoryDetail
                value={detailTarget.record}
                largeCategories={largeCategories}
                readOnly
              />
            ) : null}
            {detailTarget?.type === 'location' ? (
              <LocationDetail
                value={detailTarget.record}
                itemCount={items.filter((item) => item.location_id === detailTarget.record.id).length}
                readOnly
              />
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailTarget(null)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3200}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
    </Box>
  );
}
