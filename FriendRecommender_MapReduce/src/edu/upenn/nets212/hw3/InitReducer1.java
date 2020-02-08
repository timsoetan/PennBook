package edu.upenn.nets212.hw3;
import org.apache.hadoop.mapreduce.*;
import java.util.*;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class InitReducer1 extends Reducer<Text, Text, Text, Text> {
	
	
	
	@Override  
	public void reduce(Text key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException {
		
		
		String keyString = key.toString();
		
		System.out.println("************** InitReducer key: " + keyString);
		Set<String> test = new HashSet<String>();
		
		String interests = "";
		String affiliation = "";
		String friends = "";
		
		for (Text v : values) {
			String vString = v.toString();
			test.add(vString);
			
			String [] vArray = vString.split("\t");
			for(int i = 0; i < vArray.length; i++) {
				String currstring = vArray[i];
				if (currstring.charAt(0) == '@') {
					affiliation = currstring.substring(1);
				}
				else if (currstring.charAt(0) == '&') {
					interests = currstring.substring(1);
				}
				
				else if (currstring.charAt(0) == '*') {
					friends = currstring.substring(1);
				}
			}
		}
		
		
		String newstring = affiliation + "\t" + interests + "\t" + friends;
		

		context.write(key, new Text(newstring));
		System.out.println("value: " + test.toString());
	
	}
}
