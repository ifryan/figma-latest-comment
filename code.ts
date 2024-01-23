figma.showUI(__html__);

interface comments {
  order_id: string;
}

// 展示评论数量
var num = 62;

// filekey辞典
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
      const text = [];
      for (let i = 0; i < sortedJson.length + 1; i++) {
        // 达到约定数量或者展示全部条数
        if (sortedJson[i].parent_id == '') {
          if (i >= num || i === sortedJson.length) {
            figma.ui.postMessage(text);
            // console.log(text);
            break;
          }
          const commentLink = "https://www.figma.com/file/" + tree[fileName] + "?node-id=" + sortedJson[i].client_meta.node_id + "#" + sortedJson[i].id;
          text.push(`#${sortedJson[i].order_id} ${sortedJson[i].message}</br>${commentLink}`)
        } else {
          continue;
        }
      }
      // 传递参数

    } else {
      throw new Error("response.status");
    }
  } catch (error) {
    console.log(error);

  }
}
getComment(fileUrl);

