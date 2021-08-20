const fetch = require("node-fetch");

// function to get blogposts
async function getAllBlogposts() {
  // max number of records to fetch per query
  const recordsPerQuery = 100;

  // number of records to skip (start at 0)
  let recordsToSkip = 0;

  let makeNewQuery = true;

  let blogposts = [];

  // make queries until makeNewQuery is set to false
  while (makeNewQuery) {
    try {
      // initiate fetch

      let CMS_URL;

      if(process.env.NODE_ENV === 'develop') {
        CMS_URL = "http://localhost:1337/graphql"

      } else {
        CMS_URL = "http://vcgames-cmd.herokuapp.com/graphql"

      }

      const data = await fetch(CMS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{
              posts {
              id
              Title
              content
              date
              author {
                username
              }
              cover {
                url
              }
            }
          }`,
        }),
      });

      // store the JSON response when promise resolves
      const response = await data.json();

      // handle CMS errors
      if (response.errors) {
        let errors = response.errors;
        errors.map((error) => {
          console.log(error.message);
        });
        throw new Error("Houston... We have a CMS problem");
      }

      // update blogpost array with the data from the JSON response
      blogposts = blogposts.concat(response.data.posts);

      // prepare for next query
      recordsToSkip += recordsPerQuery;

      // stop querying if we are getting back less than the records we fetch per query
      if (response.data.posts.length < recordsPerQuery) {
        makeNewQuery = false;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  // format blogposts objects
  const blogpostsFormatted = blogposts.map((item) => {

    return {
      id: item.id,
      title: item.Title,
      slug: item.Title.replace(' ', '-'),
      body: item.content,
      author: item.author.username,
      date: item.date,

      cover: item.cover[0].url
    };
  });

  // return formatted blogposts
  return blogpostsFormatted;
}

// export for 11ty
module.exports = getAllBlogposts;