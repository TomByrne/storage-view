import { FileNode } from "../store/jobsSlice/types";

export default function removePathOverlaps(files:FileNode[]): FileNode[] {
    const ret = [];

    for(const file1 of files){
        let contained = false;
        for(const file2 of files){
            if(file1 !== file2 && file1.path.indexOf(file2.path) === 0){
                contained = true;
                break;
            }
        }
        if(!contained) ret.push(file1);
    }

    return ret;
}