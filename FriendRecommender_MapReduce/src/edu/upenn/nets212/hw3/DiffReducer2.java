package edu.upenn.nets212.hw3;

import java.io.IOException;

import org.apache.hadoop.io.*;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class DiffReducer2 extends Reducer<Text, DoubleWritable, Text, Text>{
	@Override  
	public void reduce(Text key, Iterable<DoubleWritable> values, Context context) 
			throws IOException, InterruptedException {
		
		double maxDiff = -1.0;
		
		//iterate through all weights
		for (DoubleWritable val: values) {
			String diff = val.toString();
			Double diffDouble = Double.parseDouble(diff);
			
			//get maximum weight
			if(diffDouble > maxDiff) {
				maxDiff = diffDouble;
			}
		}
		
		//emit maximum weight
		Text diffText = new Text(Double.toString(maxDiff));
		context.write(diffText, new Text(""));
		
	}
}