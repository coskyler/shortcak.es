import 'dart:convert';

import 'package:flutter/material.dart';

import '../utils/GlobalData.dart';import '../utils/getAPI.dart';

class CardsScreen extends StatefulWidget {
  @override
  _CardsScreenState createState() => _CardsScreenState();
}

class _CardsScreenState extends State<CardsScreen> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.red,
        body: SafeArea(
          child: MainPage(),
        )
    );
  }
}

class MainPage extends StatefulWidget {
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {

  String message = '', newMessageText = '';
  String addMessage = '', newAddMessage = '';
  String searchMessage = '', newSearchMessage = '';

  String card = '', search = '';
  void changeText() {
    setState(() {
      message = newMessageText;
    });
  }

  void changeAddText() {
    setState(() {
      addMessage = newAddMessage;
    });
  }

  void changeSearchText() {
    setState(() {
      searchMessage = newSearchMessage;
    });
  }


  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        padding: EdgeInsets.all(16.0),

        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,

          children: <Widget>[

            Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                        children: <Widget>[
                          Container(
                            width: 200,
                            child:
                            TextField (
                              onChanged: (text)
                              {
                                search = text;
                              },

                              decoration: InputDecoration(
                                  filled: true,
                                  fillColor: Colors.white,
                                  border: OutlineInputBorder(),
                                  labelText: 'Search',
                                  hintText: 'Search for a Card'
                              ),
                            ),
                          ),
                          Row(
                            children: <Widget>[
                              Text('$searchMessage',style: TextStyle(fontSize: 14 ,color:Colors.black)),
                            ],
                          ),

                        ]
                    ),
                  ),
                  ElevatedButton(
                      child: Text('Search',style: TextStyle(fontSize: 14 ,color:Colors.black)),

                      onPressed: () async
                      {
                        newSearchMessage = "";
                        changeSearchText();

                        String payload = '{"userId":"' + GlobalData.userId.toString() + '","search":"' + search.trim() + '"}';

                        var jsonObject;
                        try
                        {
                          String url = 'http://testubuntu.com/LAMPAPI/SearchColors.php';
                          String ret = await CardsData.getJson(url, payload); // Changed CardsData to getAPI
                          jsonObject = json.decode(ret);
                        }
                        catch(e)
                        {
                          newSearchMessage = e.toString();
                          changeSearchText();
                          return;
                        }

                        var results = jsonObject["results"];
                        var i = 0;
                        while( true )
                        {
                          try
                          {
                            newSearchMessage += results[i];
                            newSearchMessage += "\n";
                            i++;
                          }
                          catch(e)
                          {
                            break;
                          }
                        }

                        changeSearchText();


                      },
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.brown[50],
                          foregroundColor: Colors.black,
                          padding: EdgeInsets.all(8.0)
                      )
                  )

                ]
            ),

            Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      children: <Widget>[
                        Container(
                          width: 200,
                          child:
                          TextField (
                            onChanged: (text)
                            {
                              card = text;
                            },

                            decoration: InputDecoration(
                                filled: true,
                                fillColor: Colors.white,
                                border: OutlineInputBorder(),
                                labelText: 'Add',
                                hintText: 'Add a Card'
                            ),
                          ),
                        ),
                        Row(
                          children: <Widget>[
                            Expanded(
                              child: Text('$addMessage',style: TextStyle(fontSize: 14 ,color:Colors.black)),
                            ),

                          ],
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                      child: Text('Add',style: TextStyle(fontSize: 14 ,color:Colors.black)),
                      onPressed: () async
                      {
                        newAddMessage = "";
                        changeAddText();

                        String payload = json.encode({
                          "color": card.trim(),
                          "userId": GlobalData.userId
                        });


                        var jsonObject;
                        try
                        {
                          String url = 'http://testubuntu.com/LAMPAPI/AddColor.php';
                          // It seems CardsData is not defined in this file. Assuming it's a typo for getAPI
                          String ret = await CardsData.getJson(url, payload); // Changed CardsData to getAPI
                          if (ret.trim().isEmpty) {
                            newAddMessage = "No server response";
                            changeAddText();
                          } else {
                            newAddMessage = ret.trim();
                            changeAddText();
                          }
                        }
                        catch(e)
                        {
                          newAddMessage = e.toString();
                          changeAddText();
                          return;
                        }

                        newAddMessage = "Card has been added";
                        changeAddText();
                      },

                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.brown[50],
                          foregroundColor: Colors.black,
                          padding: EdgeInsets.all(8.0)
                      )
                  )

                ]
            ),

            Row(
              children: <Widget>[
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.brown[50],
                    foregroundColor: Colors.black,
                    padding: EdgeInsets.all(8.0),
                  ),
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  child: Text(
                    'To Login',
                    style: TextStyle(fontSize: 14),
                  ),
                ),
              ],
            )
          ],
        )

    );
  }

}
