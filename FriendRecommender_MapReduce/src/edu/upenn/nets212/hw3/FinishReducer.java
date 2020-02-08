package edu.upenn.nets212.hw3;

import java.io.IOException;
import java.util.*;

import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class FinishReducer extends Reducer<Text, Text, Text, Text>{
	@Override  
	public void reduce(Text key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException {
		
		HashMap<String, Double> map = new HashMap<>();
		
		for(Text val: values) {
			String valstring = val.toString();
			String[] valarray = valstring.replace(" ", "").split("%");
			String weightname = valarray[0];
			String weightnum = valarray[1];
			double weightdouble = Double.parseDouble(weightnum);
			map.put(weightname, weightdouble);
		}
		 
		//LinkedHashMap preserve the ordering of elements in which they are inserted
		LinkedHashMap<String, Double> newmap = new LinkedHashMap<>();
		 
		//Use Comparator.reverseOrder() for reverse ordering
		map.entrySet()
		    .stream()
		    .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder())) 
		    .forEachOrdered(x -> newmap.put(x.getKey(), x.getValue()));
		 
		//System.out.println("Reverse Sorted Map   : " + reverseSortedMap);
		
		ArrayList<String> list = new ArrayList<String>();
		Set<String> keyset = newmap.keySet();
		Iterator<String> iter = keyset.iterator();
		while(iter.hasNext()) {
			String currkey = iter.next();
			double currval = newmap.get(currkey);
			String newlabel = currkey;
			list.add(newlabel);
		}
		
		String liststring = list.toString().replace(" ", "").substring(1, list.toString().replace(" ", "").length() - 1);
		context.write(key, new Text(liststring));
		
	}
}
