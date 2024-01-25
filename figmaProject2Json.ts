import axios from 'axios';

let tree: { [key: string]: string } = {};
const team_id: string[] = ["1128603199120173633",];
const headers = { 'X-FIGMA-TOKEN': 'figd_CkpNatwsdOufiNRQbeZU5CMih-ksKKciVn1yQX37', }


const fetchProjectData = async (list: string[] = []) => {
    const p: string[] = [];
    for (const element of list) {
        const teamUrl = `https://api.figma.com/v1/teams/${element}/projects`
        const response = await axios.get(teamUrl, { headers });
        p.push(...response.data.projects.map((item: { id: string; }) => {
            return item.id
        }))
    }
    return p;
}

const fetchProjectFileData = async (list: string[] = [], keyOrName: string) => {
    const p: string[] = [];
    for (const element of list) {
        const fileUrl = `https://api.figma.com/v1/projects/${element}/files`
        const response = await axios.get(fileUrl, { headers });
        p.push(
            ...response.data.files.map((item: { keyOrName: string }) => {
                return (item as any)[keyOrName]
            })
        )
        // console.log('fileResponse', p);
    }
    return p;
}

// 使用.then

// function createTree(ProjectFileKey: Promise<string[]>, ProjectFileName: Promise<string[]>) {

//     ProjectFileKey
//         .then(res => {
//             Promise.all(res.map((item, index) => {
//                 ProjectFileName.then(fileName => {
//                     tree[item] = fileName[index]
//                 })
//             }))
//         }).then(() => {
//             // console.log(tree);
//             return tree
//         })
// }

// 使用await

async function createTree(ProjectFileKey: Promise<string[]>, ProjectFileName: Promise<string[]>) {
    const fileKey = await ProjectFileKey;
    const fileName = await ProjectFileName;

    fileName.forEach((item, index) => {
        tree[item] = fileKey[index]
    });

    console.log(tree);
    return tree;
}

// 使用.then

fetchProjectData(team_id).then(res => {

    const ProjectFileKey = fetchProjectFileData(res, "key").then(res => {
        // console.log('这是 fileKey', `共有${res.length}个文件`, res)
        return res
    })
    const ProjectFileName = fetchProjectFileData(res, "name").then(res => {
        // console.log('这是 filename', `共有${res.length}个文件`, res)
        return res
    })

    createTree(ProjectFileKey, ProjectFileName);
})


// 使用await

// (async () => {
//     const res = await fetchProjectData(team_id);
//     const ProjectFileKey = fetchProjectFileData(res, "key").then(res => res);
//     const ProjectFileName = fetchProjectFileData(res, "name").then(res => res);
//     await createTree(ProjectFileKey, ProjectFileName);
//     // 现在可以随时使用全局变量 tree 了
// })();
