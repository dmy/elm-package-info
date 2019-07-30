async function getElmJson(pkg) {
    const host = window.location.host;
    let url;
    if (host.startsWith("old")) {
        url = `https://${host}/packages/${pkg.author}/${pkg.name}/${pkg.version}/elm-package.json`;
    } else {
        url = `https://${host}/packages/${pkg.author}/${pkg.name}/${pkg.version}/elm.json`;
    }

    const response = await window.fetch(url);
    let elmJson = await response.json();
    elmJson.date = response.headers.get("last-modified");
    return elmJson;
}

function addPackageInfo() {
    let info = document.createElement("div");
    info.id = "elm-package-info";
    document.body.appendChild(info);
}

function updatePackageInfo(pkg, elmJson) {
    let info = document.getElementById("elm-package-info");
    if (!info) { return };

    info.style.display = "none";
    info.style.position = "absolute";
    info.style.paddingLeft = "20px";
    info.style.borderLeft = "1px solid #eeeeee"
    info.style.backgroundColor = "white";

    let dependencies = document.createElement("div");
    for (let [name, constraint] of Object.entries(elmJson.dependencies)) {
        let dep = document.createElement("div");
        dep.style.whiteSpace = "nowrap";

        let link = document.createElement("a");
        link.setAttribute("href", `/packages/${name}/latest`);
        link.textContent = name;
        let span = document.createElement("span");
        span.textContent = " " + constraint;
        dep.appendChild(link);
        dep.appendChild(span);
        dependencies.appendChild(dep);
    }
    let content = document.createElement("div");

    let avatar = document.createElement("img");
    avatar.src = `https://github.com/${pkg.author}.png?size=64`;
    avatar.style.display = "block";
    avatar.setAttribute("width", "64");
    avatar.setAttribute("height", "64");
    avatar.setAttribute("alt", `${pkg.author} GitHub profile`);
    let profile = document.createElement("a");
    profile.setAttribute("href", `https://github.com/${pkg.author}`);
    profile.style.textAlign = "top";
    profile.appendChild(avatar);
    content.appendChild(profile);

    let releaseHeader = document.createElement("h2");
    releaseHeader.style.marginTop = "14px";
    releaseHeader.style.marginBottom = "10px";
    releaseHeader.textContent = "Release";
    content.appendChild(releaseHeader);

    let releaseDateLink = document.createElement("a");
    releaseDateLink.setAttribute("href", `https://github.com/${pkg.author}/${pkg.name}/releases`);
    releaseDateLink.textContent = elmJson.date;
    let releaseDate = document.createElement("div");
    releaseDate.appendChild(releaseDateLink);
    content.appendChild(releaseDate);

    let license = document.createElement("a");
    license.setAttribute("href",
        `https://raw.githubusercontent.com/${pkg.author}/${pkg.name}/${elmJson["version"]}/LICENSE`
    );
    license.textContent = elmJson.license;
    content.appendChild(license);

    let depsHeader = document.createElement("h2");
    depsHeader.style.marginBottom = "10px";
    depsHeader.textContent = 'Dependencies';
    content.appendChild(depsHeader);

    let elmInstall = document.createElement("a");
    elmInstall.setAttribute("href", "https://guide.elm-lang.org/install.html");
    elmInstall.setAttribute("alt", "Install Elm");
    elmInstall.textContent = "elm";
    let elmVersion = document.createElement("span");
    elmVersion.textContent =  " " + elmJson["elm-version"];
    let elm = document.createElement("div");
    elm.appendChild(elmInstall);
    elm.appendChild(elmVersion);

    content.appendChild(elm);
    content.appendChild(dependencies);

    while (info.firstChild) {
        info.removeChild(info.firstChild);
    }
    info.appendChild(content);
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
        // Extend to right border to hide conflicts with the footer.
        info.style.right = "0";
        info.style.display = "block";
    } else if (info) {
        info.style.diplay = "none";
    }
}

function isNewPackage(oldPkg, newPkg) {
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

var pkg = getPackage();
addPackageInfo();
update(pkg);

// Update on url changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "update") {
        const newPkg = getPackage();
        let info = document.getElementById("elm-package-info");
        if (!newPkg) {
            if (info) {
                info.style.display = "none";
            }
        } else if (isNewPackage(pkg, newPkg)) {
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