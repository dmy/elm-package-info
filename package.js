const defaultPackages = [
    "elm/browser",
    "elm/core",
    "elm/html",
    "elm-lang/core",
    "elm-lang/html"
];


async function getElmJson(pkg) {
    const host = window.location.host;
    let url;
    if (host.startsWith("old")) {
        url = `https://${host}/packages/${pkg.author}/${pkg.name}/${pkg.version}/elm-package.json`;
    } else {
        url = `https://${host}/packages/${pkg.author}/${pkg.name}/${pkg.version}/elm.json`;
    }

    const response = await window.fetch(url);
    const elmJson = await response.json();
    elmJson.date = response.headers.get("last-modified");
    return elmJson;
}

function addPackageInfo() {
    const info = document.createElement("div");
    info.id = "elm-package-info";
    document.body.appendChild(info);
}

function updatePackageInfo(pkg, elmJson) {
    const info = document.getElementById("elm-package-info");
    if (!info) {
        return
    };

    info.style.display = "none";
    info.style.position = "absolute";
    info.style.paddingLeft = "20px";
    info.style.borderLeft = "1px solid #eeeeee"

    const content = document.createElement("div");

    // GitHub Avatar
    const avatar = document.createElement("img");
    avatar.src = `https://github.com/${pkg.author}.png?size=64`;
    avatar.style.display = "block";
    avatar.setAttribute("width", "64");
    avatar.setAttribute("height", "64");
    const profile = document.createElement("a");
    profile.setAttribute("href", `https://github.com/${pkg.author}`);
    profile.appendChild(avatar);
    content.appendChild(profile);

    // Release Header
    const releaseHeader = document.createElement("h2");
    releaseHeader.style.marginTop = "14px";
    releaseHeader.style.marginBottom = "10px";
    releaseHeader.textContent = "Release";
    content.appendChild(releaseHeader);

    // Release Date
    const releaseDateLink = document.createElement("a");
    releaseDateLink.setAttribute("href", `https://github.com/${pkg.author}/${pkg.name}/releases`);
    releaseDateLink.textContent = elmJson.date;
    const releaseDate = document.createElement("div");
    releaseDate.style.whiteSpace = "nowrap";
    releaseDate.appendChild(releaseDateLink);
    content.appendChild(releaseDate);

    // License
    const license = document.createElement("a");
    license.style.whiteSpace = "nowrap"
    license.setAttribute("href",
        `https://raw.githubusercontent.com/${pkg.author}/${pkg.name}/${elmJson["version"]}/LICENSE`
    );
    license.textContent = elmJson.license;
    content.appendChild(license);

    if (defaultPackages.indexOf(`${pkg.author}/${pkg.name}`) == -1) {
        // Install Header
        const installHeaderTitle = document.createElement("span");
        installHeaderTitle.textContent = "Install";
        const installHeaderHint = document.createElement("span");
        installHeaderHint.style.opacity = "0";
        installHeaderHint.textContent = " copied";

        const installHeader = document.createElement("h2");
        const copyToClipboardIcon = createCopyToClipboardIcon();
        installHeader.appendChild(installHeaderTitle);
        installHeader.appendChild(copyToClipboardIcon);
        content.appendChild(installHeader);

        // Install Instruction
        const installCommand = document.createElement("pre");
        installCommand.onclick = () => copyToClipboard(installCommand, copyToClipboardIcon);
        installCommand.style.boxSizing = "content-box";
        installCommand.style.paddingLeft = "4px";
        installCommand.style.minWidth = "200px";
        if (isOldFormat(elmJson)) {
            installCommand.textContent = `elm-package install ${pkg.author}/${pkg.name}`;
        } else {
            installCommand.textContent = `elm install ${pkg.author}/${pkg.name}`;
        }
        const install = document.createElement("div");
        install.appendChild(installCommand);
        content.appendChild(install);
    }

    // Dependencies Header
    const depsHeader = document.createElement("h2");
    depsHeader.style.marginBottom = "10px";
    depsHeader.textContent = 'Dependencies';
    content.appendChild(depsHeader);

    // elm version
    const elmInstall = document.createElement("a");
    elmInstall.setAttribute("href", "https://guide.elm-lang.org/install.html");
    elmInstall.textContent = "elm";
    const elmVersion = document.createElement("span");
    elmVersion.textContent = " " + elmJson["elm-version"];
    const elm = document.createElement("div");
    elm.style.whiteSpace = "nowrap"
    elm.appendChild(elmInstall);
    elm.appendChild(elmVersion);
    content.appendChild(elm);

    // Dependencies
    const dependencies = document.createElement("div");
    for (const [name, constraint] of Object.entries(elmJson.dependencies)) {
        const link = document.createElement("a");
        link.setAttribute("href", `/packages/${name}/latest`);
        link.textContent = name;

        const span = document.createElement("span");
        span.textContent = " " + constraint;

        const dep = document.createElement("div");
        dep.style.whiteSpace = "nowrap";
        dep.appendChild(link);
        dep.appendChild(span);
        dependencies.appendChild(dep);
    }
    content.appendChild(dependencies);

    while (info.firstChild) {
        info.removeChild(info.firstChild);
    }
    info.appendChild(content);
}

function createCopyToClipboardIcon() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttributeNS(null, "viewbox", "0 0 24 24");
    svg.setAttributeNS(null, "width", "24");
    svg.setAttributeNS(null, "height", "24");
    svg.style.display = "inline-block";
    svg.style.opacity = "0";
    svg.style.transform = "translateY(6px)";
    svg.style.marginLeft = "4px";

    const frame = document.createElementNS(svgNS, "path");
    frame.setAttributeNS(null, "d", "M0 0h24v24H0z");
    frame.setAttributeNS(null, "fill", "none");

    const path1 = document.createElementNS(svgNS, "path");
    path1.setAttributeNS(null, "fill", "currentColor");
    path1.setAttributeNS(null, "stroke-width", ".66667");
    path1.setAttributeNS(null, "d", `m11.667 10.333h1.3333v-1.3333h-1.3333zm0
        10.667h1.3333v-1.3333h-1.3333zm2.6667 0h1.3333v-1.3333h-1.3333zm-5.3333
        0h1.3333v-1.3333h-1.3333zm0-2.6667h1.3333v-1.3333h-1.3333zm0-2.6667h1.3333v
        -1.3333h-1.3333zm0-2.6667h1.3333v-1.3333h-1.3333zm0-2.6667h1.3333v-1.3333h
        -1.3333zm10.667 8h1.3333v-1.3333h-1.3333zm0-2.6667h1.3333v-1.3333h-1.3333zm0
        5.3333h1.3333v-1.3333h-1.3333zm0-8h1.3333v-1.3333h-1.3333zm0-4v1.3333h1.3333v-1.3333zm-5.3333
        1.3333h1.3333v-1.3333h-1.3333zm2.6667 10.667h1.3333v-1.3333h-1.3333zm0-10.667h1.3333v-1.3333h-1.3333z`);

    const path2 = document.createElementNS(svgNS, "path");
    path2.setAttributeNS(null, "fill", "currentColor");
    path2.setAttributeNS(null, "stroke-width", ".88889");
    path2.setAttributeNS(null, "d", `m17.222 2.7778h-3.7156c-0.37333-1.0311-1.3511
        -1.7778-2.5067-1.7778-1.1556 0-2.1333 0.74667-2.5067 1.7778h-3.7156c-0.97778
        0-1.7778 0.8-1.7778 1.7778v12.444c0 0.97778 0.8 1.7778 1.7778 1.7778h12.444c0.97778
        0 1.7778-0.8 1.7778-1.7778v-12.444c0-0.97778-0.8-1.7778-1.7778-1.7778zm-6.2222 0c0.48889
        0 0.88889 0.4 0.88889 0.88889 0 0.48889-0.4 0.88889-0.88889 0.88889s-0.88889-0.4-0.88889-0.88889c0-0.48889
        0.4-0.88889 0.88889-0.88889zm4.4444 12.444h-8.8889v-8.8889h8.8889z`);

    svg.appendChild(frame);
    svg.appendChild(path1);
    svg.appendChild(path2);

    return svg;
}

function copyToClipboard(element, hint) {
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");

    hint.style.opacity = "1";
    window.requestAnimationFrame(() => {
        hint.style.transition = "opacity 1000ms";
        hint.style.opacity = "0";
        setTimeout(() => {
            hint.style.transition = null;
        }, 1000);
    });
}

function isOldFormat(elmJson) {
    if (!elmJson) {
        return false;
    }
    const version = elmJson["elm-version"].substring(0, 4);
    return ["0.14", "0.15", "0.16", "0.17", "0.18"].indexOf(version) >= 0;
}

function getPackage() {
    const paths = window.location.pathname.split("/");
    const pkg = {
        author: paths[2],
        name: paths[3],
        version: paths[4]
    };
    if (pkg.author && pkg.name && pkg.version) {
        return pkg;
    }
    return undefined;
}

function update(pkg) {
    if (pkg) {
        getElmJson(pkg).then(elmJson => updatePackageInfo(pkg, elmJson));
    }
}

function updatePosition() {
    const info = document.getElementById("elm-package-info");
    const pkgNavs = document.getElementsByClassName("pkg-nav");
    if (info && pkgNavs && pkgNavs.length > 0) {
        const pkgNav = pkgNavs[0];
        const rect = pkgNav.getBoundingClientRect();
        info.style.left = (rect.x).toString() + "px";
        info.style.top = (rect.y + rect.height).toString() + "px";
        info.style.display = "block";
        translateFooter();
    } else if (info) {
        info.style.display = "none";
    }
}

function translateFooter() {
    window.requestAnimationFrame(() => {
        const info = document.getElementById("elm-package-info");
        const footers = document.getElementsByClassName("footer");
        if (info && footers && footers.length > 0) {
            const footer = footers[0];
            const footerRect = footer.getBoundingClientRect();
            const infoRect = info.getBoundingClientRect();
            const translateY = getTranslateY(footer);
            const offset = Math.max(0, Math.round(infoRect.bottom - (footerRect.top - translateY) + 64));
            footer.style.transform = "translateY(" + offset.toString() + "px)";
        }
    });
}

function getTranslateY(element) {
    if (!element) {
        return 0;
    }
    const style = window.getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m42;
}

function packageChanged(oldPkg, newPkg) {
    if (!oldPkg && !newPkg) {
        return false;
    }
    if (newPkg && !oldPkg) {
        return true;
    }
    if (newPkg.author !== pkg.author) {
        return true;
    }
    if (newPkg.name !== pkg.name) {
        return true;
    }
    if (newPkg.version !== pkg.version) {
        return true;
    }
    return false;
}

function resetFooterTranslation() {
    const footers = document.getElementsByClassName("footer");
    if (footers && footers.length > 0) {
        footers[0].style.transform = null;
    }
}

var pkg = getPackage();
addPackageInfo();
update(pkg);

// Update on url changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "update") {
        const newPkg = getPackage();
        const info = document.getElementById("elm-package-info");
        if (!newPkg) {
            if (info) {
                info.style.display = "none";
            }
        } else if (packageChanged(pkg, newPkg)) {
            resetFooterTranslation();
            update(newPkg);
            pkg = newPkg;
        }
    }
});

// Update position on DOM changes
const config = { attributes: true, childList: true, subtree: true };
const observer = new MutationObserver((mutationList, observer) => {
    updatePosition();
});
observer.observe(document.body, config);

// Update postion on resize
if (typeof ResizeObserver !== 'undefined') {
    // Needed on Chrome to detect scrollbars appearing
    const resizeObserver = new ResizeObserver(entry => {
        updatePosition();
    });
    resizeObserver.observe(document.body);
} else {
    window.onresize = () => {
        updatePosition();
    };
}