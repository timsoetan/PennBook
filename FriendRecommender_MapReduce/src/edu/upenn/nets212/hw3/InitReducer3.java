package edu.upenn.nets212.hw3;

import java.io.IOException;

import java.util.*;

import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;

public class InitReducer3 extends Reducer<Text, Text, Text, Text>{
	
	public void reduce(Text key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException{
		
		String keystring = key.toString();
		Set<String> usersset = new HashSet<String>();
		
		//if key is interest
		if (keystring.charAt(0) == '@') {
			for (Text v: values) {
				usersset.add(v.toString().replace(" ", ""));
			}
			
			String usersstring = usersset.toString().replace(" ", "");
			usersstring = usersstring.substring(1, usersstring.length() - 1);
			Text userstext = new Text(usersstring);
			context.write(new Text(keystring.substring(1)), userstext);
		}
		
		
		
		//if key is user
		else {
			for (Text v: values) {
				String valstring = v.toString();
				String [] valarray = valstring.split("\t");
				context.write(new Text(key), new Text(valarray[0]));
				context.write(new Text(key.toString().replace(" ", "").substring(1) + "%" + "shadow"), new Text(key.toString() 
						+ "\t" + valarray[1]));
				System.out.println("XXXXXXXXXXX" + key.toString().replace(" ", "").substring(1) + "%" + "shadow");
			}
			
		}
		
	}
	
	

}
