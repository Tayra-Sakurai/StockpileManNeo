/**
 * @fileoverview The large category specific editor.
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
import { Typography } from "@mui/material";
import { useParams } from "react-router";
import LargeCategoryDetail from "../LargeCategoryDetail.jsx";

function LargeCategoryEdit() {
  const { id } = useParams();

  if (!id) throw new Error('Invalid id was given.');

  const handleId = parseInt(id);

  return (
    <>
      <Typography
        component="h2"
        variant="h2"
      >
        分類を編集
      </Typography>
      <LargeCategoryDetail id={handleId} />
    </>
  );
}

export default LargeCategoryEdit;