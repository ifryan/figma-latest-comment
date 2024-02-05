
figma.showUI(__html__, { themeColors: false, width: 400, height: 300 })


interface comments {
  order_id: string;
}

let uiConfig: {
  token: string;
  team_id: string;
  tree: { [key: string]: string };
  comments: string[];
  [key: string]: string | object; // 添加一个索引签名，允许额外的属性
} = {
  token: '',
  team_id: '',
  tree: {},
  comments: []
}

// 获取当前打开插件的figma文件名
const fileName = figma.root.name as keyof typeof uiConfig.tree;

// 展示评论数量
let num = 10;

// 设置本地储存函数
function setLocalData(key: string, data: any) {
  figma.clientStorage.setAsync(key, data)
}

// 读取本地储存函数
async function getDataFromClientStorage(key: string): Promise<any> {
  try {
    // 从客户端存储获取数据
    const storedData = await figma.clientStorage.getAsync(key);

    // 如果存在数据，则将其解析为原始对象
    if (storedData) {
      return storedData;
    } else {
      console.log('No data found for the given key');
      return null;
    }
  } catch (err) {
    console.error('Error retrieving data:', err);
    return null;
  }
}

// 读取team内项目
const fetchProjectData = async (list: string[] = []) => {

  const promiseList = list.map(async (element) => {
    const url = `https://api.figma.com/v1/teams/${element}/projects`
    const response = (await fetch(url, { headers: { "X-FIGMA-TOKEN": uiConfig.token } })).json();
    return response
  })
  return Promise.all(promiseList)
}

// 读取项目内文件
const fetchFileData = async (list: { id: string }[] = []) => {
  const promiseList = list.map(async (element) => {
    const url = `https://api.figma.com/v1/projects/${element.id}/files`
    return (await fetch(url, { headers: { "X-FIGMA-TOKEN": uiConfig.token } })).json()
  });
  // console.log('fetchFileData responseall:', promiseList);
  return Promise.all(promiseList)
}

//读取文件内评论
async function getComment(fileUrl: string) {
  try {
    const response = await fetch(fileUrl, { headers: { "X-FIGMA-TOKEN": uiConfig.token } })
    if (response.ok) {
      const json = await response.json();
      // console.log(json, "\n");
      let sortedJson = json.comments.slice().sort((a: comments, b: comments) => parseInt(b.order_id) - parseInt(a.order_id));
      // console.log('sortedJson', sortedJson);
      for (let i = 0; i < num - 1; i++) {
        // 达到约定数量或者展示全部条数 //修改判断逻辑
        if (i === sortedJson.length) {
          // console.log('getComment:', uiConfig.comments);
          break;
        }
        // 判断是否为子评论
        if (sortedJson[i].client_meta !== null) {
          const commentLink = "https://www.figma.com/file/" + uiConfig.tree[fileName] + "?node-id=" + sortedJson[i].client_meta.node_id + "#" + sortedJson[i].id;
          uiConfig.comments.push(`#${sortedJson[i].order_id} ${sortedJson[i].message}</br>${commentLink}`)
        }
      }
    } else {
      throw new Error("response.status");
    }
  } catch (error) {
    console.log(error);

  }
}



// 调用函数读取数据

const uiconfigIndex = ['token', 'team_id', 'tree']
const promiseList = uiconfigIndex.map(async i => {
  const res = await getDataFromClientStorage(i)
  if (res) {
    console.log(`${i}:`, res);
    uiConfig[i] = res
  }
});

Promise.all(promiseList).then(async () => {
  if (uiConfig.team_id !== '') {
    const fileUrl = "https://api.figma.com/v1/files/" + uiConfig.tree[fileName] + "/comments";
    await getComment(fileUrl);
    figma.ui.postMessage(uiConfig);
    // console.log('figma.ui.postMessage Promise.all:', uiConfig);
  } else {
    //接受 teamURl 和 figmaToken 
    figma.ui.onmessage = async (message) => {
      // console.log("got this from the UI", message)
      let projectsList: { id: string }[] = [];
      uiConfig.team_id = message.team_id
      uiConfig.headers = message.headers
      const projectsArray = await fetchProjectData(message.team_id)
      projectsArray.forEach(element => {
        projectsList.push(...element.projects)
      });

      // console.log('projectsList:', projectsList);//这是 team 下所有 projects 的列表，格式如：{id: '58572026', name: '0_Workspace'}
      const fileArray = await fetchFileData(projectsList)
      // console.log('fileArray', fileArray);
      fileArray.forEach(element => {
        element.files.forEach((file: { key: string, name: string }) => {
          uiConfig.tree[file.name] = file.key
        });
      });
      // console.log('tree: ', uiConfig.tree);

      setLocalData('token', message.headers['X-FIGMA-TOKEN'])
      setLocalData('team_id', message.team_id)
      setLocalData('tree', uiConfig.tree)
    }
  }
})