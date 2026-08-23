/**
 * @fileoverview The dialog displayed before the item is removed.
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
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

/**
 * Removal action.
 * @callback RemovalCallback
 * @returns {Promise<void>}
 */

/**
 * The dialog component for confirming data removal.
 * @param {object} props The props.
 * @param {boolean} props.open The opening state.
 * @param {import("react").Dispatch<import("react").SetStateAction<boolean>>} props.setOpen The set state action.
 * @param {RemovalCallback} props.callback The removal action.
 * @returns {import("react").JSX.Element} The dialog.
 */
function RemoveConfirmDialog({ open, setOpen, callback }) {
  const handleClose = () => setOpen(false);
  const handleAction = async () => {
    await callback();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
    >
      <DialogTitle>
        削除しますか？
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          データベースから項目を削除しようとしています．この操作を行うと関連データとしてこのデータ以外のデータがデータベースから削除される可能性があります．また，この操作は取り消すことができません．本当に削除しますか？
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={handleClose}>キャンセル</Button>
        <Button type="button" onClick={handleAction}>削除</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RemoveConfirmDialog;