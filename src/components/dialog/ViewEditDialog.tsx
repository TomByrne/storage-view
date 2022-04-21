import React from 'react';
import './ViewEditDialog.css';

interface ViewEditDialogProps {
    view?: string;
}

function ViewEditDialog({
    view
}: ViewEditDialogProps) {
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
            </div>
        </div>
    );
}

export default ViewEditDialog;
