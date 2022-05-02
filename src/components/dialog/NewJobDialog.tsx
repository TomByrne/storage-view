import { dialog } from '@tauri-apps/api';
import { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { createJob } from '../../store/jobsSlice/jobsSlice';
import './NewJobDialog.scss';

interface NewJobDialogProps {
    closable?: boolean;
    onClose?: () => void;
}
function NewJobDialog({ closable, onClose }: NewJobDialogProps) {
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

    function getPathInfo() {
        if (path) {
            return <div className='option' key="scan">
                    <div>Path to scan:</div>
                    <div>{path}</div>
                    <button onClick={create}>Begin Scan</button>
                </div>
        }
    }

    function closeButton() {
        if (closable && onClose) {
            return <button onClick={onClose}>X</button>
        }
    }

    function create() {
        if (path) dispatch(createJob(path));
    }

    return (
        <div className="new-job dialog-cont">
            <div className="blocker" />
            <div className="new-job dialog">
                <h2 className='title'>Select Path
                    {closeButton()}
                </h2>
                <div className='content options'>
                    <div className='option' key="browse">
                        <div>Select a path</div>
                        <button onClick={browse}>Browse</button>
                    </div>
                    {getPathInfo()}
                </div>
            </div>
        </div >
    );
}

export default NewJobDialog;
