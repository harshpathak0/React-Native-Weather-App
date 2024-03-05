import React, { useCallback, useEffect, useState } from 'react';
import { Image, SafeAreaView, StatusBar, TextInput, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme';
import { CalendarDaysIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from 'lodash';
import { fetchLocation, fetchWeatherForecast } from '../api/weatherApp';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utils/asyncStorage';

const HomeScreen = () => {
   const [showSearch, toggleSearch] = useState(false);
   const [locations, setLocations] = useState([]);
   const [weather, setWeather] = useState({});
   const [loading, setLoading] = useState(false);

   const handleLocation = (loc) => {
      setLocations([]);
      toggleSearch(false);
      setLoading(true);
      fetchWeatherForecast({
         cityName: loc.name,
         days: '7'
      }).then(data => {
         setWeather(data);
         setLoading(false);
         storeData('city', loc.name);
      })
   }

   const handleSearch = value => {
      //FetchLocation
      if (value.length > 2) {
         fetchLocation({ cityName: value })
            .then(data => {
               setLocations(data);
            })
      }
   }
   useEffect(() => {
      fetchMyWeatherData();
   }, [])

   const fetchMyWeatherData = async () => {
      let myCity = await getData("city");
      let cityName = "Delhi";
      if (myCity) cityName = myCity;

      fetchWeatherForecast({
         cityName,
         days: "7"
      }).then(data => {
         setWeather(data);
         setLoading(false);
      })
   }
   const handleTextDebounce = useCallback(debounce(handleSearch, 12), []);
   const { current, location } = weather;
   return (
      <View className="flex-1 relative">
         <StatusBar style="light" />
         <Image
            blurRadius={90}
            source={require("../assets/images/backgroundImg.png")}
            className=' w-full h-full absolute'
         />
         {
            loading ? (
               <View className='flex-1 flex-row justify-center items-center'>
                  <Progress.CircleSnail thickness={10} size={140} color="#ebb434" />
               </View>
            ) : (
               <SafeAreaView className=" flex flex-1">
                  {/* search section */}
                  <View className=" mx-4 z-50 m-5">
                     <View className=" h-17 flex-row justify-end items-center rounded-full"
                        style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>

                        {
                           showSearch ? (
                              <TextInput
                                 onChangeText={handleTextDebounce}
                                 placeholder='Search city'
                                 placeholderTextColor={"lightgray"}
                                 className=' pl-6 h-10 flex-1 text-base text-white'
                              />
                           ) : null
                        }

                        <TouchableOpacity
                           onPress={() => toggleSearch(!showSearch)}
                           style={{ backgroundColor: theme.bgWhite(0.3) }}
                           className=' rounded-full p-3 m-1'
                        >
                           <MagnifyingGlassIcon size="25" color="white" />
                        </TouchableOpacity>
                     </View>
                     {
                        locations.length > 0 && showSearch ? (
                           <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
                              {
                                 locations.map((loc, index) => {
                                    let showBorder = index + 1 != locations.length;
                                    let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';

                                    return (
                                       <TouchableOpacity
                                          onPress={() => handleLocation(loc)}
                                          key={index}
                                          className={' flex-row items-center border-0 p-3 px-4 mb-1' + borderClass}>
                                          <MapPinIcon size="20" color="gray" />
                                          <Text className='text-black text-lg ml-2'>{loc?.name},{loc?.country} United Kingdom </Text>
                                       </TouchableOpacity>
                                    )
                                 })
                              }
                           </View>
                        ) : null
                     }
                  </View>

                  {/* forecast section */}
                  <View className=' mx-4 flex justify-around flex-1 mb-2'>

                     {/* location */}
                     <Text className=' text-white text-center text-2xl font-bold'>
                        {location?.name},
                        <Text className=' text-lg font-semibold text-gray-300'>
                           {" " + location?.country}
                        </Text>
                     </Text>

                     {/* Weather image */}
                     <View className='flex-row justify-center '>
                        <Image
                           //source={require("../assets/images/cloudSun.png")}
                           source={{ uri: 'https:' + current?.condition?.icon }}
                           className='w-52 h-52'
                        />
                     </View>

                     {/* degree celcius */}
                     <View className='space-y-2 '>
                        <Text className=' text-center font-bold text-white text-6xl ml-5'>
                           {current?.temp_c}&#176;
                        </Text>
                        <Text className=' text-center text-white text-xl ml-5 tracking-widest'>
                           {current?.condition?.text}
                        </Text>
                     </View>

                     {/* other stats */}
                     <View className=' flex-row justify-between mx-4'>
                        <View className=' flex-row space-x-2 items-center'>
                           <Image source={require("../assets/images/wind1.png")} className=' w-10 h-10' />
                           <Text className='text-white font-semibold text-base'>
                              {current?.wind_kph}km
                           </Text>
                        </View>
                        <View className=' flex-row space-x-2 items-center'>
                           <Image source={require("../assets/images/drop.png")} className=' w-10 h-10' />
                           <Text className='text-white font-semibold text-base'>
                              {current?.humidity}%
                           </Text>
                        </View>
                        <View className=' flex-row space-x-2 items-center'>
                           <Image source={require("../assets/images/sun.png")} className=' w-10 h-10' />
                           <Text className='text-white font-semibold text-base'>
                              {/* {weather?.forecast?.forecastday[0]?.astro?.sunrise} */}
                              {current?.last_updated.split(" ")[1]}
                           </Text>
                        </View>
                     </View>

                     {/* forecast for next days */}
                     <View className=' mb-2 space-y-3' >
                        <View className='flex-row items-center mx-5 space-x-2'>
                           <CalendarDaysIcon size='22' color='white' />
                           <Text className='text-white text-base'>Daily forecast</Text>
                        </View>
                        <ScrollView
                           horizontal
                           contentContainerStyle={{ paddingHorizontal: 5 }}
                           showsHorizontalScrollIndicator={false}
                        >
                           {
                              weather?.forecast?.forecastday?.map((item, index) => {
                                 let date = new Date(item.date);
                                 let options = { weekday: 'long' };
                                 let dayName = date.toLocaleDateString('en-us', options);
                                 dayName = dayName.split(",")[0];
                                 return (
                                    <View
                                       key={index}
                                       className='flex justify-center items-center w-24 rounded-3xl py-3 mr-3 space-y-4 '
                                       style={{ backgroundColor: theme.bgWhite(0.15) }}
                                    >
                                       <Image
                                          // source={require("../assets/images/heavyRain.png")}
                                          source={{ uri: 'https:' + item?.day?.condition?.icon }}
                                          className=' w-12 h-11'
                                       />
                                       <Text className=' text-white'>{dayName}</Text>
                                       <Text className=' text-white text-xl font-semibold'>
                                          {item?.day?.avgtemp_c}&#176;
                                       </Text>
                                    </View>
                                 )
                              })
                           }

                        </ScrollView>

                     </View>

                  </View>
               </SafeAreaView>
            )
         }

      </View>
   );
};

export default HomeScreen;
