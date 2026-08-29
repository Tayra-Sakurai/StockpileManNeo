/**
 * @fileoverview The thanks component.
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

import { Accordion, AccordionDetails, AccordionSummary, Link, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useId } from "react";

/**
 * The thanks component.
 * @param {Object} props The props.
 * @param {string} props.name The package name.
 * @param {string=} props.licenses The license expression.
 * @param {string=} props.publisher The package publisher name.
 * @param {string=} props.repository The package repository URI.
 * @param {string=} props.email The e-mail address of the publisher.
 * @returns
 */
function ThanksData(props) {
  const accId = useId();

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id={`${accId}-header`}
        aria-controls={`${accId}-content`}
      >
        <Typography component="span">{props.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          {props.name}は{
            props.licenses &&
            <>
              <Link href="https://spdx.org/licenses/">{props.licenses}</Link>の規定の下で
            </>
          }{
            props.publisher &&
            (
              props.email ?
                <>
                  <Link href={`mailto:${props.email}`}>{props.publisher}</Link>により，
                </> :
                `${props.publisher}により，`
            )
          }{
            props.repository &&
            <><Link href={props.repository}>{props.repository}</Link>上で</>
          }公開されたものです．
        </Typography>
        {
          props.publisher &&
          <Typography>
            Copyright &copy; {props.publisher}
          </Typography>
        }
      </AccordionDetails>
    </Accordion>
  );
}

export default ThanksData;