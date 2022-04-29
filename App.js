import {createStackNavigator} from 'react-navigation';
import MyapplicationList from './Pages/MyapplicationList.pages';

// to disable yellow box until dev done
console.disableYellowBox = true;

export default createStackNavigator({
  MyapplicationList: {
    screen: MyapplicationList,
    navigationOptions:{
      headerTitle: 'Application List'
    }
  },
});
