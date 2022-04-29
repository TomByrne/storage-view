import { dialog } from '@tauri-apps/api';
import { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { createJob } from '../../store/jobsSlice/jobsSlice';
import './NewJobDialog.scss';

interface NewJobDialogProps {
    closable?: boolean;
}
function NewJobDialog({ closable }: NewJobDialogProps) {
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

    function listDrives() {
        const ret = [
            <div className='option' key="browse">
                <div>Select a path</div>
                <button onClick={browse}>Browse</button>
            </div>
        ]

        if (path) {
            ret.push(
                <div className='option' key="scan">
                    <div>Path to scan:</div>
                    <div>{path}</div>
                    <button onClick={create}>Begin Scan</button>
                </div>
            );
        }

        return ret;
    }

    function create() {
        if (path) dispatch(createJob(path));
    }

    return (
        <div className="new-job dialog-cont">
            <div className="blocker" />
            <div className="new-job dialog">
                <h2 className='title'>Select Path </h2>
                <div className='content options'>
                    {listDrives()}
                </div>
            </div>
        </div >
    );
}

export default NewJobDialog;
