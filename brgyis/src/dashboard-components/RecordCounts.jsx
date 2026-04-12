import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button
} from "@mui/material";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Records");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const file = new Blob([buffer], {
    type: "application/octet-stream"
  });

  saveAs(file, `${fileName}.xlsx`);
};

const RecordCounts = ({ open, onClose, title, data }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>

        <Button
          variant="contained"
          onClick={() => exportToExcel(data, title)}
          sx={{ mb: 2 }}
        >
          Download Excel
        </Button>

        <table width="100%" border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Address</th>
              <th>Birthdate</th>
              <th>Contact</th>
            </tr>
          </thead>

          <tbody>
            {data.map((u, i) => (
              <tr key={i}>
                <td>{u.name}</td>
                <td>{u.age}</td>
                <td>{u.address}</td>
                <td>{u.birthdate}</td>
                <td>{u.contact_no}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </DialogContent>
    </Dialog>
  );
};

export default RecordCounts;