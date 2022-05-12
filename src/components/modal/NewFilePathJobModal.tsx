import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from "@mui/material";
import { useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { createJob } from '../../store/jobsSlice';
import { dialog } from '@tauri-apps/api';
import { Box } from "@mui/system";

interface NewFilePathJobModalProps {
    open: boolean,
    handleClose?: () => void,
}
const fieldStyle = {
    mt: 3,
    width: 400,
}

export default function NewFilePathJobModal({
    open,
    handleClose,
}: NewFilePathJobModalProps) {

    const [path, setPath] = useState<string | undefined>();
    const dispatch = useAppDispatch();

    function browse() {
        dialog.open({
            title: "Select a path to scan",
            directory: true,
        })
            .then((res: string | string[]) => {
                const str = (typeof res == "string" ? res : undefined);
                setPath(str);
            })
    }

    function beginScan() {
        if (path) dispatch(createJob(path));
        if(handleClose) handleClose();
    }

    function onTextChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPath(e.target.value);
    }

    return <Dialog
        open={open}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
    >
        <DialogTitle id="dialog-title">
            New File Path Scan
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="dialog-description">
                Select a file path to begin scanning.
            </DialogContentText>
            <TextField sx={fieldStyle} value={path} multiline minRows={3} onChange={onTextChange}/>
        </DialogContent>
        <DialogActions>
            <Button onClick={browse}><Box>Browse</Box></Button>

            <Button onClick={beginScan} disabled={!path}>
                Begin Scan
            </Button>
        </DialogActions>
    </Dialog>;
}