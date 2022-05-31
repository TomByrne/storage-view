import { FileNode, FileNodeTheme } from "../store/jobsSlice/types";

const themes: Record<string, FileNodeTheme> = {
}

export function getTheme(node: FileNode): FileNodeTheme | undefined {
    if (!node.info || node.info.is_dir) return undefined;

    const ext = node.name.substring(node.name.lastIndexOf(".") + 1);
    return themes[ext] || defaultTheme;
}

export function addTheme(exts: string[], theme: FileNodeTheme) {
    for (var ext of exts) themes[ext] = theme;
}


// Any other files
export const defaultTheme: FileNodeTheme = {
    id: "default",
    colors: ["#dfeb74", "#b2bb61"]
}

// code
addTheme(["js", "ts", "jsx", "tsx", "c", "h", "java", "class", "obj", "cgi", "pl", "py", "rs", "sh", "ps1", "swift", "vb", "cpp", "as", "hx", "vue"], {
    id: "code",
    colors: ["#45d45d", "#309742"],
});

// text
addTheme(["txt", "md"], {
    id: "text",
    colors: ["#458fd4", "#326494"],
});

// markup
addTheme(["json", "xml", "csv", "xml", "log", "html", "htm", "xhtml", "map", "css", "scss", "strings"], {
    id: "markup",
    colors: ["#9b45d4", "#6d3096"],
});

// compressed archives
addTheme(["zip", "7z", "arj", "rar", "pkg", "rpm", "tar", "gz", "z"], {
    id: "archives",
    colors: ["#eedd49", "#a89d36"],
});

// videos
addTheme(["mp4", "flv", "mpg", "mpeg", "mov", "avi", "f4v", "3g2", "3gp", "h264", "m4v", "mkv", "rm", "vob", "wmv"], {
    id: "videos",
    colors: ["#ee4949", "#9e3131"],
});

// disk images/archives
addTheme(["iso", "bin", "dat", "toast", "a", "vcd"], {
    id: "disk-images",
    colors: ["#4f9932", "#346421"],
});

// audio
addTheme(["mp3", "wav", "aif", "cda", "mid", "midi", "mpa", "ogg", "wma", "wpl"], {
    id: "audio",
    colors: ["#ee4972", "#9e304c"],
});

// professional source docs
addTheme(["ai", "psd", "fla"], {
    id: "professional-src",
    colors: ["#26d852", "#188533"],
});

// image
addTheme(["png", "ico", "ps", "svg", "jpg", "jpeg", "bmp", "atf"], {
    id: "image",
    colors: ["#ee49a9", "#a03172"],
});

// font
addTheme(["woff", "woff2", "ttf", "fnt", "fon", "otf", "eot"], {
    id: "font",
    colors: ["#19c544", "#179436"],
});

// source control
addTheme(["git", "pack", "idx", "gitignore", "gitmodules"], {
    id: "source-control",
    colors: ["#3b20b3", "#221269"],
});

// desktop publishing
addTheme(["pdf", "doc", "docx", "ppt", "xls"], {
    id: "desktop-publishing",
    colors: ["#9291d8", "#605f8d"],
});

// application packages
addTheme(["apk", "ipa", "msi", "exe", "deb", "dmg", "swf", "swc", "swz", "ane", "jar", "air", "dll", "jnilib", "so"], {
    id: "application-packages",
    colors: ["#9291d8", "#605f8d"],
});