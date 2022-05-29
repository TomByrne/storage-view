import { BugReport, ContentCopy, Launch, Cached, AddCircle, Folder, Delete } from "@mui/icons-material";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList } from "@mui/material";
import { clipboard, shell } from "@tauri-apps/api";
import React, { useEffect, createRef } from "react";
import { useSelector } from "react-redux";
import { selectContext } from "../../store/contextSlice";
import { useAppDispatch } from "../../store/hooks";
import { createJob, getParentPath, refresh } from "../../store/jobsSlice";
import { FileNode, JobFileInfo, JobInfo } from "../../store/jobsSlice/types";

// let explorerName = "Explorer";
// platform().then((name) => {
//     if (name === "darwin" || name === "ios") explorerName = "Finder";
// })

export default function ContextMenu() {
    const positionElem = createRef<HTMLDivElement>();
    const context = useSelector(selectContext);
    // const [pos, setPos] = useState({ x: 0, y: 0 });
    // const [show, setShow] = useState(false);
    const dispatch = useAppDispatch();

    function handleClose() {
        dispatch({ type: "context/clear" });
    }

    function onContextMenu(event: MouseEvent) {
        let nodeName = (event.target as HTMLElement)?.nodeName;
        if (nodeName === "INPUT" || nodeName === "TEXTAREA") {
            // Allow native context menu for input elements
            return;
        }
        event.preventDefault();
        dispatch({ type: "context/set", payload: { element: event.target, x: event.pageX, y: event.pageY } });
        // setPos({ x: event.pageX, y: event.pageY });
        // setShow(true);
    }

    useEffect(() => {
        const handler = (event: MouseEvent) => onContextMenu(event);
        document.addEventListener("contextmenu", handler);
        return () => document.removeEventListener("contextmenu", handler);
    });

    function copyToClipboard(path: string) {
        handleClose();
        clipboard.writeText(path);
    }

    function openFile(path: string) {
        handleClose();
        shell.open(path);
    }

    function exploreTo(info?: JobFileInfo) {
        handleClose();
        if (!info) return;
        if (info.is_dir)
            shell.open(info.path);
        else {
            const parentPath = getParentPath(info.path);
            if (parentPath) shell.open(parentPath);
        }

    }

    function refreshFile(job: JobInfo, node: FileNode) {
        handleClose();
        dispatch(refresh(job.id, node.path));
    }

    function createNewTab(node: FileNode) {
        handleClose();
        dispatch(createJob(node.path));
    }

    function deleteFile(node: FileNode) {
        handleClose();
        dispatch({ type: "jobs/delete-files-confirm", payload: { files: [node] } });
    }

    function renderJobItems(job: JobInfo) {
        //TODO: Add progress, etc
        return [
            // <MenuItem key="job-title" disabled>
            //     <ListItemText>Job: {job.name}</ListItemText>
            // </MenuItem>
        ];
    }
    function renderNodeItems(job: JobInfo, node: FileNode) {
        return [
            <MenuItem key="node-title" disabled>
                <ListItemText>{node.name}</ListItemText>
            </MenuItem>,

            <MenuItem key="node-refresh" onClick={() => refreshFile(job, node)}>
                <ListItemIcon>
                    <Cached fontSize="small" />
                </ListItemIcon>
                <ListItemText>Refresh {node.info?.is_dir ? "folder" : "file"}</ListItemText>
            </MenuItem>,

            <MenuItem key="node-new-tab" onClick={() => createNewTab(node)}>
                <ListItemIcon>
                    <AddCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Scan in new tab</ListItemText>
            </MenuItem>,

            <MenuItem key="node-delete" onClick={() => deleteFile(node)}>
                <ListItemIcon>
                    <Delete fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete {node.info?.is_dir ? "folder" : "file"}</ListItemText>
            </MenuItem>,

            !node.info ? <React.Fragment /> : <MenuItem key="node-explore" onClick={() => exploreTo(node.info)}>
                <ListItemIcon>
                    <Folder fontSize="small" />
                </ListItemIcon>
                <ListItemText>{node.info?.is_dir ? "Open folder" : "Open parent folder"}</ListItemText>
            </MenuItem>,

            node.info?.is_dir ? <React.Fragment /> : <MenuItem key="node-open" onClick={() => openFile(node.path)}>
                <ListItemIcon>
                    <Launch fontSize="small" />
                </ListItemIcon>
                <ListItemText>Open file</ListItemText>
            </MenuItem>,

            <MenuItem key="node-copy-path" onClick={() => copyToClipboard(node.path)}>
                <ListItemIcon>
                    <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy file path</ListItemText>
            </MenuItem>,
        ];
    }

    function showDevTools() {
        handleClose();
        dispatch({ type: "dev/set-devtools-shown", payload: { shown: true } });
    }
    function devItems() {
        return [
            <MenuItem key="dev-open" onClick={showDevTools}>
                <ListItemIcon>
                    <BugReport fontSize="small" />
                </ListItemIcon>
                <ListItemText>Show Devtools</ListItemText>
            </MenuItem>
        ];
    }


    function renderItems() {
        let ret: JSX.Element[] = [];
        if (context.job) {
            ret = ret.concat(renderJobItems(context.job));

            if (context.node) {
                if (ret.length) ret.push(<Divider key="divider-1" />);
                ret = ret.concat(renderNodeItems(context.job, context.node));
            }
        }
        if (process.env.NODE_ENV === "development") {
            if (ret.length) ret.push(<Divider key="divider-2" />);
            ret = ret.concat(devItems());
        }
        return ret;
    }

    const items = renderItems();


    return <div>
        <div id="context-pos" style={{ position: 'absolute', left: context.x + "px", top: context.y + "px", background: "#000" }} ref={positionElem} />
        <Menu
            anchorEl={document.getElementById("context-pos")}
            open={!!context.element && !!items.length}
            onClose={handleClose}
        >
            <MenuList>
                {items}
            </MenuList>
        </Menu>
    </div>;
}