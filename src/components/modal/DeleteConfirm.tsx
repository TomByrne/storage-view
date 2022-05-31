import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { useAppDispatch } from "../../store/hooks";
import { deleteFilesAsync } from "../../store/jobsSlice";
import { FileNode } from "../../store/jobsSlice/types";

interface DeleteConfirmProps {
    files: FileNode[] | undefined,
}

export default function DeleteConfirm({
    files,
}: DeleteConfirmProps) {

    const dispatch = useAppDispatch();

    function cancelDelete() {
        dispatch({ type: "jobs/delete-files-cancel" });
    }

    function doDelete() {
        if (!files) return;
        dispatch(deleteFilesAsync({ files }));
    }

    function listFiles() {
        if (!files) return null;
        return files.map((f) => <Box key={f.path}>{f.path}</Box>);
    }

    let desc = '';
    if (files) {
        if (files.length === 1) {
            const file = files[0];
            desc = file.info?.is_dir ? "this folder" : "this file";
        } else {
            desc = files.length + " files/folders";
        }
    }

    return <Dialog
        open={!!files}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
    >
        <DialogTitle id="dialog-title">
            Are you sure you want to permanently delete {desc}?
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="dialog-description">
                {listFiles()}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={cancelDelete} color="secondary">Cancel</Button>
            <Button onClick={doDelete} color="primary">Delete</Button>
        </DialogActions>
    </Dialog>;
}