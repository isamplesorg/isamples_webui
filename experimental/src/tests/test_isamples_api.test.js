import {ISamplesAPI} from "../js/isamples-api";

// FFS testing frameworks w=don't work with modules?! WTF 

test_record_original('original IGSN:NHB0005JH', async () => {
    const API = new ISamplesAPI();
    const id = "NHB0005JH"
    let res = await API.thing(`IGSN:{id}`, format="original")
    expect(res.igsn).toBe(id);
})

