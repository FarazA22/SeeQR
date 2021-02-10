import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  Typography,
  TextField,
  Button,
  Divider,
} from '@material-ui/core/';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import styled from 'styled-components';

// Button Container
const ButtonContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

// TextField Container
const TextFieldContainer = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Styled Button
const StyledButton = styled(Button)`
  margin: 20px;
  padding: 8px 2px;
  width: 40%;
  height: 10%;
  size: small;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const StyledTextField = styled(TextField)`
  width: 80%;
`;

const { dialog } = require('electron').remote;

const { ipcRenderer } = window.require('electron');

type AddNewDbModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddNewDbModal = ({ open, onClose }: AddNewDbModalProps) => {
  const [newDbName, setNewDbName] = useState('');
  const handleClose = () => {
    onClose();
  };

  // Set schema name
  const handleDbName = (event: React.ChangeEvent<HTMLInputElement>) => {
    // convert input label name to lowercase only with no spacing to comply with db naming convention.
    const dbNameInput = event.target.value;
    let dbSafeName = dbNameInput.toLowerCase();
    // TODO: Change to allow hypens, dash, numbers
    dbSafeName = dbSafeName.replace(/[^A-Z0-9]/gi, '');
    setNewDbName(dbSafeName);
  };

  const handleFileClick = () => {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Custom File Type', extensions: ['sql'] }],
        message: 'Please upload .sql database file',
      })
      .then((result: object) => {
        const filePathArr = result['filePaths'];

        // send via channel to main process
        if (!result['canceled']) {
          ipcRenderer.send('input-schema', {
            schemaName: newDbName,
            schemaFilePath: filePathArr,
          });
          return handleClose();
        }
      })
      .catch((err: object) => {
        // TODO: Error handling
        console.log(err);
      });
  };

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={handleClose}
        aria-labelledby="modal-title"
        open={open}
      >
        <TextFieldContainer>
          <DialogTitle id="alert-dialog-title">
            Import Existing Database
          </DialogTitle>
          <Divider variant="middle" />
          <Typography paragraph align="center" id="alert-dialog-description">
            Please select a .sql file
          </Typography>

          <StyledTextField
            id="filled-basic"
            label="Enter a database name"
            size="small"
            variant="outlined"
            onChange={handleDbName}
          />
        </TextFieldContainer>
        <ButtonContainer>
          <StyledButton
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleFileClick}
          >
            Import File
          </StyledButton>
        </ButtonContainer>
      </Dialog>
    </div>
  );
};

export default AddNewDbModal;