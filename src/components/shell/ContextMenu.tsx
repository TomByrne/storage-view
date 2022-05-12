import { BugReport, ContentCopy, Launch } from "@mui/icons-material";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList } from "@mui/material";
import { clipboard, shell } from "@tauri-apps/api";
import { platform } from "@tauri-apps/api/os";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectContext } from "../../store/contextSlice";
import { FileNode, JobInfo } from "../../store/jobsSlice/types";

let explorerName = "Explorer";
platform().then((name) => {
    if(name === "darwin" || name === "ios") explorerName = "Finder";
})

export default function ContextMenu() {
    const context = useSelector(selectContext);
    // const [pos, setPos] = useState({ x: 0, y: 0 });
    // const [show, setShow] = useState(false);
    const dispatch = useDispatch();

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
        dispatch({type:"context/set", payload: { element:event.target }});
        // setPos({ x: event.pageX, y: event.pageY });
        // setShow(true);
    }

    useEffect(() => {
        const handler = (event: MouseEvent) => onContextMenu(event);
        document.addEventListener("contextmenu", handler);
        return () => document.removeEventListener("contextmenu", handler);
    });

    function copyToClipboard(path:string) {
        handleClose();
        clipboard.writeText(path);
    }

    function openFile(path:string) {
        handleClose();
        shell.open(path);
    }

    function renderJobItems(job: JobInfo) {
        //TODO: Add progress, etc
        return [
            // <MenuItem key="job-title" disabled>
            //     <ListItemText>Job: {job.name}</ListItemText>
            // </MenuItem>
        ];
    }
    function renderNodeItems(node: FileNode) {
        return [
            <MenuItem key="node-title" disabled>
                <ListItemText>{node.name}</ListItemText>
            </MenuItem>,
            
            <MenuItem key="node-copy-path" onClick={() => openFile(node.path)}>
                <ListItemIcon>
                    <Launch fontSize="small" />
                </ListItemIcon>
                <ListItemText>{node.info?.is_dir ? "Show in " + explorerName : "Open file"}</ListItemText>
            </MenuItem>,
            
            <MenuItem key="node-copy-path" onClick={() => copyToClipboard(node.path)}>
                <ListItemIcon>
                    <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy file path</ListItemText>
            </MenuItem>,
            
            // No API to show files in OS yet
            // <MenuItem key="node-explore">
            //     <ListItemIcon>
            //         <DriveFileMove fontSize="small" />
            //     </ListItemIcon>
            //     <ListItemText>Show in {explorerName}</ListItemText>
            // </MenuItem>
        ];
    }

    function openDevTools(){
        handleClose();
        debugger;
    }
    function devItems() {
        return [
            <MenuItem key="dev-open" onClick={openDevTools}>
                <ListItemIcon>
                    <BugReport fontSize="small" />
                </ListItemIcon>
                <ListItemText>Open Devtools</ListItemText>
            </MenuItem>
        ];
    }


    function renderItems() {
        let ret:JSX.Element[] = [];
        if (context.job) {
            ret = ret.concat(renderJobItems(context.job));
        }
        if (context.node) {
            if(ret.length) ret.push(<Divider key="divider-1"/>);
            ret = ret.concat(renderNodeItems(context.node));
        }
        if(process.env.NODE_ENV === "development") {
            if(ret.length) ret.push(<Divider key="divider-1"/>);
            ret = ret.concat(devItems());
        }
        return ret;
    }

    const items = renderItems();


    return <Menu
        anchorEl={context.element}
        open={!!context.element && !!items.length}
        onClose={handleClose}
    >
        <MenuList>
            {items}
        </MenuList>
    </Menu>;
}