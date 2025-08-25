import { CONST } from "../common/const.js";
import contentModel from "../model/content.js";

function replaceMarkdownLinks(baseUrl, markdown) {
  const replacedText = markdown.replace(
    /!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
    `![$1](${baseUrl}$2)`
  );
  return replacedText;
}

const extractTitle = (markdown) => {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : null;
};

const extractImageUrls = (markdown) => {
  const imageUrls = [];
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    imageUrls.push(match[1]);
  }
  return imageUrls;
};

const fetchContents = async (PATH, FILE) => {
  const URL = CONST.ARTICLE_REPOSITORY_URL + "md/" + PATH + FILE + ".md";

  try {
    const response = await fetch(URL);
    if (!response.ok) {
      if (response.status == 404) {
        const contentData = await contentModel.checkContentByPath(PATH + FILE);
        if (contentData.Count > 0) {
          for (let key in contentData.Items) {
            console.log("PATH : " + PATH + FILE);
            console.log("ID:" + contentData.Items[key].Id + " を削除します");
            await contentModel.deleteItem(contentData.Items[key].Id);
          }
        }
      }
    } else {
      let markdown = await response.text();
      markdown = replaceMarkdownLinks(
        CONST.ARTICLE_REPOSITORY_URL + "md/" + PATH,
        markdown
      );
      const title = extractTitle(markdown);
      const images = extractImageUrls(markdown);
      let imgUrl = CONST.PROVIDER_URL + "/img/dummy.jpg";
      if (images.length > 0) {
        imgUrl = images[0];
      }
      countUp(PATH + FILE, title, imgUrl);
      return markdown;
    }
  } catch (error) {
    console.log("FILE NOT FOUND", error);
  }
};

const countUp = async (PATH, title, img) => {
  const content = {
    path: PATH,
    title: title,
    imgurl: img,
  };
  let contentData = await contentModel.getContentByPath(PATH, content);

  if (contentData.Title) {
    contentData.Title = title;
    contentData.Imgurl = img;
    contentData.AccessCount = Number(contentData.AccessCount) + 1;
    await contentModel.updateItem(contentData);
  } else if (contentData.Items) {
    let updateData = contentData.Items[0];
    updateData.AccessCount = 1;
    for (let key in contentData.Items) {
      updateData.AccessCount =
        updateData.AccessCount + Number(contentData.Items[key].AccessCount) + 1;
      if (Number(key) > 0) {
        await contentModel.deleteItem(contentData.Items[key].Id);
      }
    }
    await contentModel.updateItem(updateData);
  }
};

const getContent = async (params) => {
  const PATH = params.lang + "/" + params.dir + "/";
  const FILE = params.md;
  const contents = await fetchContents(PATH, FILE);
  return { Path: PATH + FILE, Contents: contents };
};

const getList = async () => {
  const result = await contentModel.getItems("count");
  return result;
};

const deleteContent = async (PATH) => {
  let contentData = await contentModel.checkContentByPath(PATH);
  return contentData;
};

const contentsConnect = {
  deleteContent,
  getContent,
  getList,
};

export default contentsConnect;
