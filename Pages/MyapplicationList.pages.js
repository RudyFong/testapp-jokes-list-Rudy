/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Text, View, Modal, ScrollView, TouchableOpacity} from 'react-native';
import styles from './MyapplicationList.styles';
import {result, map, filter, lowerCase, find, size} from 'lodash';

const TransactionListPage = ({navigation}) => {
  // state for save data from api, or from another function
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [isVisible, setVisibility] = useState(false);
  const [categories, setCategories] = useState([]);
  const [lisCategories, setListCategories] = useState([]);
  const [modalInterface, setModalInterface] = useState('');

  const getTansactionList = () => fetch('https://v2.jokeapi.dev/categories').
    then((response) => response.json()).
    then((json) => {
      const categoriesS = result(json, 'categories', []);
      setLoading(result(json, 'error', true));
      const filterCatgories = map(categoriesS, function(o) { 
        return {categories: o, isColapsible: false}; 
      });
      setCategories(filterCatgories);
      const lengthCateg = categoriesS.length;
      let listCategories = [];
      let i = 0;
      do {
 
         const category = categoriesS[i];
         const apiData = 'https://v2.jokeapi.dev/joke/'+categoriesS[i]+'?type=single&amount=2';
fetch(apiData).
    then((response) => response.json()).
    then((json) => {

      const categoriesS = result(json, 'jokes', []);
      listCategories = [...listCategories, {type:category, jokes:categoriesS, reload: 0}]; 

      setListCategories(listCategories);
    }).
    catch(() => {
      // jika error akan muncul reload button
      setLoading(false);
      setError(true);
    });
       i = i + 1;
} while (i < lengthCateg);
      setTimeout(() =>  setLoading(false), 1000);
        setListCategories(listCategories);
    }).
    catch(() => {
      setLoading(false);
      setError(true);
    });

    const getlistMore = (data) => () => fetch('https://v2.jokeapi.dev/joke/'+data+'?type=single&amount=2').
    then((response) => response.json()).
    then((json) => {
      const newJokes = result(json, 'jokes', []);

      // const categoriesS = json.jokes;
       const filterCatgories = map(lisCategories, function(o) { 
        const type = result(o, 'type', '');
        const jokes = result(o, 'jokes', []); 
        const reload = result(o, 'reload', 0);
        const checkingAll = lowerCase(data) === lowerCase(type) ? {type: type, jokes: [...jokes, ...newJokes], reload: reload + 1} : o;
        return checkingAll; 
      });

      setListCategories(filterCatgories);

    }).
    catch(() => {
      // jika error akan muncul reload button
      setLoading(false);
      setError(true);
    });

  useEffect(() => {
    getTansactionList();
  }, []);


    const goToTop = (value= '') => () => {
      const getExist = filter(categories, function(o) { 
        const cekExist = result(o, 'categories', '');
        return lowerCase(cekExist) === lowerCase(value); 
      });
        const getNonExist = filter(categories, function(o) { 
        const cekExist = result(o, 'categories', '');
        return lowerCase(cekExist) !== lowerCase(value); 
      });
      setCategories([...getExist, ...getNonExist]);
  }; 

  const setColapsible = (value= '') => () => {
      const listCategories = categories;
      const filterCatgories = map(listCategories, function(o) { 
        const categories = result(o, 'categories'); 
        const isColapsible = result(o, 'isColapsible', false);
        const checkingAll = lowerCase(value) === lowerCase(categories) ? {categories: categories, isColapsible: !isColapsible} : o;
        return checkingAll; 
      });
      setCategories(filterCatgories);
  }; 
  const goToModal = (value= '') => () => {
      setVisibility(true);
      setModalInterface(value);
  }; 
  // untuk render list transaksi
  const renderlistItems = (value={}, i) => {
    const resultCtegories = result(value, 'categories', '');
    const filterTask = find(lisCategories, function(o) { 
        const cekExist = result(o, 'type', '');
        return lowerCase(cekExist) === lowerCase(resultCtegories); 
      });
    const listJokes = result(filterTask, 'jokes', []);
    const isColapsible = result(value, 'isColapsible', false);
    const reload = result(filterTask, 'reload', 0);
    return (
      <View>
      <TouchableOpacity onPress={setColapsible(result(value,'categories', ''))} style={styles.constainerTransactionStyle}>
        <View style={styles.styleListSuccess} />
        <View style={{justifyContent: 'center', alignItems: 'center', padding: 10}}>
          <Text>{i + 1}</Text>
        </View>
        <View style={styles.listTransactionListBox}>
          <View style={styles.listTransactionListBoxPadding}>
            <Text style={styles.generalFontWeight}>{value.categories}</Text>
          </View>
          <View style={styles.containerSuccesPendingBox}>
            {i === 0 ?
            <TouchableOpacity onPress={goToTop(result(value,'categories', ''))} style={styles.successBoxStyleTop}>
              <Text style={styles.successText}>TOP</Text> 
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={goToTop(result(value,'categories', ''))} style={styles.successBoxStyle}>
              <Text style={styles.successText}>Go TOP</Text> 
            </TouchableOpacity>
  }
          </View>
        </View>
      </TouchableOpacity>
      {isColapsible &&
        <View style={{paddingHorizontal: 10}}>
              {size(listJokes) !== 0 && listJokes.map((listJoke) =>
                <TouchableOpacity onPress={goToModal(result(listJoke, 'joke', ''))} style={styles.containerInsideDialog}>
                  <View style={styles.paddingSortText}>
                    <Text>{result(listJoke, 'joke', '')}</Text>
                  </View>
                </TouchableOpacity>
              )}
              {reload === 0 && size(listJokes) === 0 ?
              <View style={{backgroundColor: 'lightgrey', justifyContent: 'center', alignItems: 'center', padding: 5}}>
                <Text>
                  No data
                </Text>
              </View>
              :
              reload !== 2 &&
              <TouchableOpacity onPress={getlistMore(result(value,'categories', ''))} style={{backgroundColor: 'lightblue', justifyContent: 'center', alignItems: 'center', padding: 5}}>
                <Text>
                  Add more data
                </Text>
              </TouchableOpacity>
  }
        </View>
      }
      </View>
    ); 
  };

  const visibleOverlay = () => {
    setVisibility(false);
  };

  // function dimana jika data tidak tereload maka bisa di coba kembali - function if something error occured, then can be try again with button
  const ifErrorOccured = () => {
    setLoading(true);
    setError(false);
    getTansactionList();
  };

  const checkReset = filter(lisCategories, function(o) { 
        const cekExist = result(o, 'reload', '');
        return cekExist !== 0; 
      });
  return (
    <View style={styles.container}>

      <Modal visible={isVisible} animationType='fade'
        transparent={true} >
        <View style={styles.containerModal}>
          <View style={styles.containerModalInner}>
            <View style={styles.paddingInsideDialog}>
                <View style={styles.containerInsideDialogModal}>
                  <View style={styles.paddingSortText}>
                    <Text>{modalInterface}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={visibleOverlay} style={{justifyContent: 'center', alignItems:'center'}}>
                  <Text style={{color: 'red'}}>OK</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {size(checkReset) !== 0 &&
      <TouchableOpacity onPress={getTansactionList} style={styles.containerSearchSortBox}>
        <Text style={{textAlign: 'center'}}>Refresh</Text>
      </TouchableOpacity>
}
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 30, fontWeight: '700'}}>My Application</Text>
      </View>
      {isLoading ? <ActivityIndicator/> : isError ?  
        <TouchableOpacity onPress={ifErrorOccured} style={styles.errorBoxContainer}>
          <View style={styles.errorBoxStyles}>
            <Text style={styles.errorText}>Try Again reload</Text>
          </View>
        </TouchableOpacity>
      : (
        <ScrollView>
          {categories.map((value, i) =>renderlistItems(value, i))}
        </ScrollView>
      )}
    </View>
  );
};

export default TransactionListPage;