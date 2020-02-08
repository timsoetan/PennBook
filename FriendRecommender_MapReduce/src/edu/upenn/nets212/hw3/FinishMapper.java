package edu.upenn.nets212.hw3;

import java.io.IOException;
import java.util.ArrayList;

import org.apache.hadoop.io.*;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class FinishMapper extends Mapper<LongWritable, Text, Text, Text>{
	
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException {
		
		String valstring = value.toString();
		String[] valarray = valstring.split("\t");
		String name = valarray[0];
		ArrayList<String> nlist = new ArrayList<String>();
		
		if(name.contains("$") && !(name.contains("#"))) {
			//name = name.substring(0, name.length() - 1);
			String neighbors = valarray[1];
			String[] neighborsarray = neighbors.replace(" ", "").split(",");
			for (int j = 0; j < neighborsarray.length; j++) {
				nlist.add(neighborsarray[j]);
			}
			
			String weights = valarray[2].replace(" ", "");
			
			
			String[] weightsarray = weights.replace(" ", "").split(",");
			for (int i = 0; i < weightsarray.length; i++) {
				String currweight = weightsarray[i];
				String[] currweightarray = currweight.replace(" ", "").split("%");
				String weightname = currweightarray[0];
				String weightnum = currweightarray[2];
				String label = weightname + "%" +  weightnum;
				
				System.out.println("********************* nlist:" + nlist.toString());
				System.out.println("weightname:" + weightname);
				
				boolean friend = false;
				for (int k = 0; k < neighborsarray.length; k++) {
					String currneighbor = neighborsarray[k];
					System.out.println("************ currneighbor: " + currneighbor);
					System.out.println("************ weightname: " + weightname);
					if (currneighbor.replace(" ", "").equals(weightname.replace(" ", ""))){
						friend = true;
					}
				}
				
				if (!(weightname.equals(name)) && !(friend) ) {
					System.out.println("***********FinishMapper key: " + name);
					System.out.println(" value: " + label);
					context.write(new Text(name), new Text(label));
				}
				
			}
		}
	}
}
