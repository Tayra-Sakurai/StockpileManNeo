/**
 * @fileoverview Application base footer component.
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
import { Link } from "@mui/material";

function FooterNotes() {
  return (
    <>
      <p>StockpileMan&nbsp;neo Version 1.5.5.</p>
      <p>Copyright &copy; 2026 Tayra Sakurai</p>
      <p>このアプリケーションは<Link href="https://www.gnu.org/licenses/agpl.html">AGPLのバージョン3.0またはそれ以降</Link>のライセンス規定により配布されています．</p>
    </>
  );
}

export default FooterNotes;