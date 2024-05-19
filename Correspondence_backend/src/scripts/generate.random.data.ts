import fetch from 'node-fetch'


const run = () => {
    for (let i = 0; i < 30; i++) {
        let document = {
            "cc_entity": [
              ""
            ],
            "message_status": "sent",
            "docs_IDs": [
              ""
            ],
            "due_date": null,
            "delete": false,
            "draft": false,
            "replay_on": null,
            "corr_no": `${i+1}`,
            "corr_type": "correspondence type",
            "entity_no": "",
            "from_user": "mosobhy",
            "to_entity": "",
            "to_department": "",
            "corr_subject": "smite the wicked",
            "corr_body": "<h1>rightousness shall take over the comos</h1>",
            "await_reply": false,
            "classification": "normal",
            "priority": "low",
            "starred": false
          }

        fetch(
            `http://localhost:5000/api/insert`,
            {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(document)
            }
        )
        .then( (res: any) => {
            if (res.status === 200) {
                console.log("document " + i + " is inserted successfully")
            }
        })
        .catch( (err: any) => {
            console.log(err)
        })
    }
}

run()