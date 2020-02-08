package edu.upenn.nets212.hw3;
import org.apache.hadoop.mapreduce.*;
import java.util.*;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class InitReducer2 extends Reducer<Text, Text, Text, Text> {
	
	
	
	@Override  
	public void reduce(Text key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException {
		
		
		
		String keyString = key.toString();
		Set<String> labelSet = new HashSet<String>();
		String labelstring = "";
		
		for (Text v : values) {
			String vString = v.toString();
			String [] vArray = vString.split("\t");
			labelSet.add(vArray[0]);
			labelstring += vArray[0];
			
			String friends = vArray[2];
			if(!friends.equals("[]")) {
				friends = friends.toString().substring(1, friends.toString().length() - 1);
				labelstring += "," + friends;
			}
			
			String interests = vArray[1];
			if(!interests.equals("[]")) {
				interests = interests.toString().substring(1, interests.toString().length() - 1);
				labelstring += "," + interests;
			}
			
			labelstring += "\t" +  keyString + "%" + "label!" + "%" + "1";
			
			String interestString = vArray[2];
			
			String labelSetString = labelSet.toString();
			String outputValString = labelSetString.substring(1, labelSetString.length() - 1).replace(" ", "")
					+ "\t" +  keyString + "%" + "label!" + "%" + "1";
			context.write(key, new Text(labelstring));
			
		}	
	}
	
}
