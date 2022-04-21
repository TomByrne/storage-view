import React, { useState } from 'react';
import './ViewEditDialog.css';
import { invoke } from '@tauri-apps/api/tauri'

interface ViewEditDialogProps {
    view?: string;
}

function ViewEditDialog({
    view
}: ViewEditDialogProps) {
    const [res, setRes] = useState("hmm");
    function callRust() {
        invoke<string>('my_custom_command')
        .then((a1) => {
            console.log("ret: ", a1);
            setRes(a1);
        })
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
                    <div>Result: {res}</div>
                </div>
            </div>
        </div>
    );
}

export default ViewEditDialog;
