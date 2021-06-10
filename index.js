const prompt = require("prompt-async");
const { Client } = require('@elastic/elasticsearch')

const promptSchema = {
  properties: {
    esUrl: {
      required: true,
      message: 'Elasticsearch endpoint',
    },
    username: {
      pattern: /^[a-zA-Z\s\-]+$/,
      required: true
    },
    password: {
      hidden: true,
      required: true
    }
  }
};

const updatePanelsJson = (originalJson) => {
  let updateCount = 0;
  const panelsParsed = JSON.parse(originalJson);
  panelsParsed?.forEach((panel) => {
    if(panel.title === '' && panel.embeddableConfig?.hidePanelTitles === false) {
      panel.embeddableConfig.hidePanelTitles = true;
      updateCount++;
    }
  });
  return { newPanelsJSON: JSON.stringify(panelsParsed), updateCount };
};

(async () => {
  prompt.start();
  const { esUrl, username, password } = await prompt.get(promptSchema);
  const kibanaIndex = '.kibana';
  const client = new Client({
    node: esUrl,
    auth: {
      username: username,
      password: password
    }
  });

  const allDashboards = await client.search({
    index: '.kibana',
    body: {
      "query": {
        "match": {
          "type": "dashboard"
        }
      }
      "size": 10000
    }
  });
  allDashboards.body.hits?.hits?.forEach(async (hit) => {
    const dashboardId = hit._id;
    const dashboard = hit._source.dashboard;
    console.log('Analyzing: ', dashboard.title);
    const { newPanelsJSON, updateCount } = updatePanelsJson(dashboard.panelsJSON);

    if (updateCount === 0) {
      console.log('--No panels to update\n');
      return;
    }

    await client.update({
      index: kibanaIndex,
      id: dashboardId,
      body: {
        doc: {
          dashboard: {
            panelsJSON: newPanelsJSON
          }
        }
      }
    });
    console.log(`--updated ${updateCount} panels\n`);
    });
})();