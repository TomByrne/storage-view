import React, { useEffect, useState } from 'react';
import './ViewEditDialog.css';
import { invoke,  } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event';

interface ViewEditDialogProps {
    view?: string;
}

let lastJobId = 0;

function ViewEditDialog({
    view
}: ViewEditDialogProps) {
    let jobId: number | undefined;

    const [res, setRes] = useState("<no result yet>");

    useEffect(() => {
        const unlisten = listen('create_job/prog', event => {
            console.warn("create_job/prog: ", event);
        })
    
        return () => {
            unlisten.then((f) => f());
        };
    }, []);

    function callRust() {
        let id = (lastJobId++);
        // window.appWindow.emit('create_job', {id: id, path: "C:\\scripts"});
        invoke<string>('create_job', {id: id, path: "C:\\scripts"})
        .then((a1) => {
            console.log("ret: ", a1);
            setRes("OK " + a1);
        })
        .catch((e) => {
            setRes(e + '');
        });
        jobId = id;
    }
    return (
        <div className="ViewEditDialog dialog">
            <h2 className='title'>{view ? "Edit View" : "Add View"}</h2>
            <div className='content options'>
                <div className='option'>
                    <input id="option-all" type="radio" radioGroup='scan-option' />
                    <label htmlFor="option-all">All</label>
                </div>
                <div className='option'>
                    <input id="option-individual" type="radio" radioGroup='scan-option' />
                    <label htmlFor="option-individual">Individual Drives</label>
                </div>
                <div className='option'>
                    <input id="option-folder" type="radio" radioGroup='scan-option' />
                    <label htmlFor="option-folder">A Folder</label>
                </div>
                <div>
                    <button onClick={callRust}>Text Rust Method</button>
                    <div>Job: {jobId}</div>
                    <div>Result: {res}</div>
                </div>
            </div>
        </div>
    );
}

export default ViewEditDialog;
