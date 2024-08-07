let ereader = {}
ereader.page = 0
ereader.scroll = 0
ereader.scrollStart, ereader.scrollEnd = 0
ereader.settingsVisible = false

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

document.getElementById("content").addEventListener("scroll", updateScroll)
document.getElementById("content").addEventListener("click", handleMousePress)
document.addEventListener("visibilitychange", handleVisibilityChange);

let slider = document.getElementById("font-size-slider")
slider.onchange = handleFontSize
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

function setColors(textColor, bgColor) {
   document.getElementById("content").style.color = textColor
   document.getElementById("content").style.backgroundColor = bgColor 
}

function handleFontSize() {
    document.getElementById("content").style.fontSize = slider.value.toString() + "px"
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
    try {
        document.getElementById("settings").hidden = false
    }
    catch {
    }
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            parseEPUB(arrayBuffer);
            toggle_fullscreen()
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
            let id = searchManifestByHref(elements[i].attributes.href.value)
            // if (id == undefined) {
            //     id = searchManifestByHref("xhtml/" + elements[i].attributes.href.value)
            // }
            console.log(id, elements[i].attributes.href.value)
            let num = getPageNumberFromID(id)
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
        if (testName.href.value.includes(name)) {
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

function toggle_fullscreen() {
    if (!document.fullscreenElement) {
        document.body.requestFullscreen();
        // document.body.setAttribute("fullscreen",""); 
    } else {
        // document.exitFullscreen();
        // document.body.removeAttribute("fullscreen"); 
    }
}

ereader.isMobile = mobileCheck()
if (ereader.isMobile) {
    handleMobile()
}

$("#dialog").dialog({autoOpen: false});

function handleMobile() {
    document.getElementById("settings").remove()
    document.getElementsByClassName("right")[0].remove()
    document.getElementById("l").style.height = "4vh"
    document.getElementById("l").style.width = "50%"
    document.getElementById("r").style.height = "4vh"
    document.getElementById("r").style.width = "50%"
    document.getElementById("content").style.width = "calc(100vw - 20px)"
    document.getElementById("content").style.height = "calc((100vh - 20px) - 4vh)"
    document.getElementById("content-parent").appendChild(document.getElementById("l"))
    document.getElementById("content-parent").appendChild(document.getElementById("r"))
}

function showSettings() {
    if (ereader.isMobile) {
        $("#dialog").dialog("open");
    }
}

function handleVisibilityChange() {
    // if (document.hidden) {
    //     console.log("document hidden")
    // } else {
    //     toggle_fullscreen()
    // }
}

function handleMousePress(event) {
    let width = document.getElementsByTagName("body")[0].offsetWidth
    let clickX = event.clientX
    let clickY = event.clientY
    toggle_fullscreen()
    if (ereader.settingsVisible) {
        $("#dialog").dialog("close")
        ereader.settingsVisible = false
    } else {
        if (clickX < width * (1/3)) {
            changePage(-1)
        } else {
            if (clickX > width * (2/3)) {
                changePage(1)
            } else {
                showSettings()
                ereader.settingsVisible = true
            }
        }
    }
}