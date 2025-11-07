import 'dart:convert';

import 'package:flutter/material.dart';

import '../utils/GlobalData.dart';
import '../utils/getAPI.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue,
      body: MainPage(),
    );
  }
}

class MainPage extends StatefulWidget {
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {

  String message = "This is a message", newMessageText = '';
  String loginName = '', password = '';

  changeText() {
    setState(() {
      message = newMessageText;
    });
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Center( child: Container(
        width: 200,
        child:
        Column(
          mainAxisAlignment: MainAxisAlignment.center, //Center Column contents vertically,
          crossAxisAlignment: CrossAxisAlignment.center, //Center Column contents horizontal
          children: <Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: Text('$message',style: TextStyle(fontSize: 14 ,color:Colors.black)),
                ),

              ],
            ),

            Row(
                children: <Widget>[

                  Container(
                    width: 200,
                    child:
                    TextField (
                      onChanged: (text) {
                        loginName = text;
                      },

                      decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(),
                          labelText: 'Login Name',
                          hintText: 'Enter Your Login Name'
                      ),
                    ),
                  ),
                ]
            ),
            Row(
                children: <Widget>[
                  Container(
                    width: 200,
                    child:
                    TextField (
                      obscureText: true,
                      onChanged: (text) {
                        password = text;
                      },
                      decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(),
                          labelText: 'Password',
                          hintText: 'Enter Your Password'
                      ),
                    ),
                  ),
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
                  onPressed: () async
                  {
                    newMessageText = "";
                    changeText();

                    String payload = '{"login":"' + loginName.trim() + '","password":"' + password.trim() + '"}';
                    var userId = -1;
                    var jsonObject;

                    try
                    {
                      String url = 'http://testubuntu.com/LAMPAPI/Login.php';
                      String ret = await CardsData.getJson(url, payload);
                      jsonObject = json.decode(ret);
                      userId = jsonObject["id"];
                    }
                    catch(e)
                    {
                      newMessageText = e.toString();
                      changeText();
                      return;
                    }
                    if( userId <= 0 )
                    {
                      newMessageText = "Incorrect Login/Password";
                      changeText();
                    }
                    else
                    {
                      GlobalData.userId = userId;
                      GlobalData.firstName = jsonObject["firstName"];
                      GlobalData.lastName = jsonObject["lastName"];
                      GlobalData.loginName = loginName;
                      GlobalData.password = password;
                      Navigator.pushNamed(context, '/cards');
                    }
                  },

                  child: Text(
                    'Do Login',
                    style: TextStyle(fontSize: 14),
                  ),
                ),
              ],
            )
          ],
        )
    ));
  }
}
