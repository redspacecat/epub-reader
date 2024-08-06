let ereader = {}
ereader.page = 0
ereader.scroll = 0
ereader.scrollStart, ereader.scrollEnd = 0

document.getElementById("content").addEventListener("scroll", updateScroll)

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

window.onkeydown = function (e) {
    if (e.code == "ArrowRight") {
        changePage(1)
    } else {
        if (e.code == "ArrowLeft") {
            changePage(-1)
        }
    }
}

function updateScroll() {
    if (!(ereader.isScrolling)) {
        c = document.getElementById("content")
        c.scrollTop = ereader.scroll
        console.log("no scrolling")
    }
}

function handleFileSelect(event) {
    document.getElementById("fileInput").hidden = true
    document.getElementById("content").hidden = false
    document.getElementById("l").hidden = false
    document.getElementById("r").hidden = false
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            parseEPUB(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    }
}

async function parseEPUB(arrayBuffer) {
    // // Use JSZip or similar library to unzip EPUB file
    // JSZip.loadAsync(arrayBuffer).then(zip => {
    //     // Extract the necessary files and parse them
    //     zip.file('META-INF/container.xml').async('string').then(containerXML => {
    //         // Parse container.xml to find the OPF file location
    //         ereader.opfPath = extractOPFPath(containerXML);
    //         ereader.basePath = ereader.opfPath.slice(0, ereader.opfPath.indexOf("/") + 1)
    //         zip.file(ereader.opfPath).async('string').then(opfXML => {
    //             // Parse OPF file to get metadata and manifest
    //             const [metadata, manifest, toc] = parseOPF(opfXML);
    //             // Load and display content
    //             let data = {}
    //             data.zip = zip
    //             data.metadata = metadata
    //             data.manifest = manifest
    //             data.toc = toc
    //             loadContent(data, 1);
    //         });
    //     });
    // });

    // Use JSZip or similar library to unzip EPUB file
    zip = await JSZip.loadAsync(arrayBuffer)
    containerXML = await zip.file('META-INF/container.xml').async('string')
    // Parse container.xml to find the OPF file location
    ereader.opfPath = extractOPFPath(containerXML);
    ereader.basePath = ereader.opfPath.slice(0, ereader.opfPath.indexOf("/") + 1)
    opfXML = await zip.file(ereader.opfPath).async('string')
    // Parse OPF file to get metadata, manifest, and toc
    const [metadata, manifest, toc] = parseOPF(opfXML);
    // Load and display content
    let data = {}
    data.zip = zip
    data.metadata = metadata
    data.manifest = manifest
    data.toc = toc
    ereader.data = data
    loadContent(ereader.page);
}

function extractOPFPath(containerXML) {
    c = parseXML(containerXML)
    return c.children[0].children[0].children[0].attributes[0].nodeValue
    // Extract OPF path from container.xml
}

function parseOPF(opfXML) {
    // console.log(opfXML)
    o = parseXML(opfXML)
    metadata = o.children[0].children[0]
    manifest = o.children[0].children[1]
    toc = o.children[0].children[2]
    // console.log(metadata, manifest, toc)
    return [metadata, manifest, toc]
    // Parse OPF XML to extract TOC and manifest
    // Return extracted data
}

async function loadContent(page) {
    ereader.page = page
    // console.log(ereader.data.metadata, ereader.data.manifest, ereader.data.toc)
    // Load and display content based on manifest and TOC
    // Update the navigation and content areas
    let pageID = ereader.data.toc.children[page].attributes.idref.value
    let pagePath = searchManifest(pageID)
    pagePath = ereader.basePath + pagePath
    console.log("ID:", pageID)
    console.log("Path:", pagePath)
    // ereader.data.zip.file(pagePath).async("string").then(pageData => {
    //     console.log(pageData)
    // });
    pageData = await ereader.data.zip.file(pagePath).async("string")
    // console.log(pageData)
    document.getElementById("content").innerHTML = pageData

    // Load images
    let images = document.getElementById("content").getElementsByTagName("img")
    console.log("Images: ", images)
    for (let i = 0; i < images.length; i++) {
        imgPath = pagePath.slice(0, pagePath.lastIndexOf("/") + 1) + images[i].attributes.src.value
        absPath = absolutePath(imgPath)
        console.log("Image path:", imgPath)
        console.log("Absolute path:", absPath)
        images[i].src = await loadFile(absPath)
    }

    // Replace all elements with an href
    let elements = document.getElementById("content").getElementsByTagName("*")
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName == "A"/*.parentElement.parentElement.classList == "chapter"*/) {
            if (elements[i].attributes.href.value.includes("#")) {
                elements[i].attributes.href.value = elements[i].attributes.href.value.slice(0, elements[i].attributes.href.value.indexOf("#"))
            }
            let num = getPageNumberFromID(searchManifestByHref(elements[i].attributes.href.value))
            if (!(num == undefined)) {
                elements[i].href = `javascript:loadContent(${num})`
            }
        } else {
            if (elements[i].tagName == "LINK ") {
                elements[i].href = "#"
            } else {
                try {
                    filePath = pagePath.slice(0, pagePath.lastIndexOf("/") + 1) + elements[i].attributes.href.value
                    console.log(filePath)
                    absPath = absolutePath(filePath)
                    elements[i].href = await loadFile(absPath)
                }
                catch {
                }
            }
        }
        // console.log(elements[i])
    }
}

function parseXML(xmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'application/xml');
}

function searchManifest(id) {
    for (let i = 0; i < ereader.data.manifest.children.length; i++) {
        let testID = ereader.data.manifest.children[i].attributes
        if (testID.id.value == id) {
            return testID.href.value
        }
    }
    return undefined
}

function searchManifestByHref(name) {
    for (let i = 0; i < ereader.data.manifest.children.length; i++) {
        let testName = ereader.data.manifest.children[i].attributes
        if (testName.href.value == name) {
            return testName.id.value
        }
    }
    return undefined
}

function getPageNumberFromID(id) {
    for (let i = 0; i < ereader.data.toc.children.length; i++) {
        let testID = ereader.data.toc.children[i].attributes
        if (testID.idref.value == id) {
            return i
        }
    }
    return undefined
}

async function loadFile(path) {
    b = await ereader.data.zip.file(path).async("blob").then(blob => URL.createObjectURL(blob))
    return b
}

function absolutePath(path) {
    let items = path.split("/")
    for (let i = 0; i < items.length; i++) {
        if (items[i] == "..") {
            items[i] = ""
            items[i - 1] = ""
        }
    }
    // console.log(items)
    path = ""
    for (let i = 0; i < items.length; i++) {
        path += items[i]
        if (!(items[i] == "")) {
            if (i < items.length - 1) {
                path += "/"
            }
        }
    }
    return path
}

function isScrollFinished() {
    let c = document.getElementById("content")
    let count = 0
    const checkIfScrollToIsFinished = setInterval(() => {
        if (ereader.scroll === c.scrollTop) {
            ereader.isScrolling = false
            console.log("finished scrolling")
            clearInterval(checkIfScrollToIsFinished);
        }
        count += 1
        if (count > 20) {
            c.scrollTo({top: ereader.scroll})
            ereader.isScrolling = false
            console.log("finished scrolling with force")
            ereader.scrollEnd = c.scrollHeight
            ereader.scrollDifference = (ereader.scrollEnd - ereader.scrollStart) - c.offsetHeight
            // ereader.scrollDifference = ereader.scroll - document.getElementById("content").scrollTop
            clearInterval(checkIfScrollToIsFinished);
        }
    }, 25);
}

function scrollToTop() {
    ereader.scrollDifference = 0
    ereader.isScrolling = true
    ereader.scroll = 0
    document.getElementById("content").scrollTo({top: 0})
    ereader.isScrolling = false
}

function changePage(change) {
    // ereader.page += change
    // loadContent(ereader.page)
    c = document.getElementById("content")
    // if (ereader.scrollDifference < 0 && change > 0) {
    if ((ereader.scroll == 0 && (c.scrollHeight) - c.offsetHeight < 10) && change > 0) {
        scrollToTop()
        ereader.page += change
        loadContent(ereader.page)
    } else {
        if (ereader.scrollDifference < 0 && change > 0) {
            scrollToTop()
            ereader.page += change
            loadContent(ereader.page) 
        } else {
            if (ereader.scroll == 0 && change < 0) {
                scrollToTop()
                ereader.page += change
                loadContent(ereader.page)
            } else {
                if (change > 0) {
                    ereader.scroll += c.offsetHeight - 20
                } else {
                    ereader.scroll -= c.offsetHeight - 20
                }
                ereader.isScrolling = true
                ereader.scrollStart = ereader.scroll
                c.scrollTo({top: ereader.scroll, behavior: 'smooth'});
                isScrollFinished()
            }
        }
    }
}