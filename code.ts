figma.showUI(__html__);

interface comments {
  order_id: string;
}
const tree = {
  "WujieAI-2023/11": "sVu5igAaD5FcQk0GfE3Mbi",
  "无界 AI v3.0": "sK8qmvyY5bike5hVrZThTE",
  "🧭归档文件导航": "gUPHLYpDZSf69YngFjskIP",
  "plugin test": "zPC8U2pUZMXFTdOVDiXPHM",
}
const fileName = figma.root.name as keyof typeof tree;
console.log(tree[fileName]);

const fileUrl = "https://api.figma.com/v1/files/" + tree[fileName] + "/comments";
const headers = {
  // "method": "GET",
  "X-FIGMA-TOKEN": "figd_7xLLNbtyoZRciGhBF3EUlUVetYNANRgmH47yzqsg",
}
async function getComment(fileUrl: string) {
  try {
    const response = await fetch(fileUrl, { headers })
    if (response.ok) {
      const json = await response.json();
      // console.log(json, "\n");
      let sortedJson = json.comments.slice().sort((a: comments, b: comments) => parseInt(b.order_id) - parseInt(a.order_id));
      console.log(sortedJson);
      const commentLink = "https://www.figma.com/file/" + tree[fileName] + "?node-id=" + sortedJson[0].client_meta.node_id + "#" + sortedJson[0].id;
      const text = `<p style="width:100% !important;word-break:break-all;">#${sortedJson[0].order_id} ${sortedJson[0].message}</br>${commentLink}</p>`
      // 传递参数
      figma.ui.postMessage(text);
      console.log(text);
    } else {
      throw new Error("response.status");
    }
  } catch (error) {
    console.log(error);

  }
}
getComment(fileUrl);

