package edu.upenn.nets212.hw3;
import org.apache.hadoop.mapreduce.*;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class InitMapper2 extends Mapper<LongWritable, Text, Text, Text>{

	@Override
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException {
		
		//convert value to string
		String valString = value.toString();
		
		if(valString != null) {
			//split into node and neighbors
			String[] valArray = valString.split("\t");
			
			//emit labelled vertices
			String user = valArray[0];
			String labelsandfriends = valArray[1] + "\t" + valArray[2] + "\t" +valArray[3];
			
			context.write(new Text(user), new Text(labelsandfriends));
			
		}
		
		
		
	}
}
