package edu.upenn.nets212.hw3;

import java.io.IOException;
import java.util.*;
import java.util.Iterator;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class DiffReducer1 extends Reducer<Text, Text, Text, Text>{
	@Override  
	public void reduce(Text key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException {
		
		ArrayList<Double> list = new ArrayList<Double>();
		Double first = 0.0;
		Double second = 0.0;
		
		//get the weights of node in each file
		for(Text v: values) {
			list.add(Double.parseDouble(v.toString()));
		}	
		
		//if edge present in both files
		if(list.size() == 2) {
			first = list.get(0);
			second = list.get(1);
		}
		else if (list.size() == 1){
			first = list.get(0);
		}
		
		//compute difference
		Double difference = Math.abs(first - second);
		if (Double.toString(difference).contains("E")) {
			difference = 0.0;
		}
		
		Text diffText = new Text(difference.toString());
		
		//emit difference per node
		context.write(key, diffText);
		
	}
}
