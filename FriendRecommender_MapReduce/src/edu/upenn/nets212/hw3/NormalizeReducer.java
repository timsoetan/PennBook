package edu.upenn.nets212.hw3;

import java.io.IOException;

import java.util.*;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.*;

public class NormalizeReducer extends Reducer<Text, Text, Text, Text>{
	
	public void reduce(Text key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException{
		
		HashMap<String, Double> totalmap = new HashMap<>();
		ArrayList<String> datalist = new ArrayList<String>();
		HashMap<String, Double> newmap = new HashMap<>();
		
		for (Text v : values) {
			String vstring = v.toString();
			if (vstring.charAt(0) == '#') {
				String[] varray = vstring.split("\t");
				String mapkey = varray[0].replace(" ", "").split("%")[0].substring(1);
				String mapval = varray[1].replace(" ", "");
				totalmap.put(mapkey, Double.parseDouble(mapval));
			}
			else {
				datalist.add(vstring);
			}
		}
		
		
		for(int i = 0; i < datalist.size(); i++) {
			String currdata = datalist.get(i);
			String[] currdataarray = currdata.split("\t");
			if (currdataarray.length == 3) {
				String [] arrayofweights = currdataarray[2].replace(" ", "").split(",");
				ArrayList<String> newlist = new ArrayList<String>();
				for (int j = 0; j < arrayofweights.length; j++) {
					String currweight = arrayofweights[j];
					String [] currweightarray = currweight.replace(" ", "").split("%");
					String weightname = currweightarray[0];
					double weightdouble = Double.parseDouble(currweightarray[2]);
					
					double totalweight = totalmap.get(weightname);
					double newweight = weightdouble / totalweight;
				
					
					if (!(newmap.containsKey(weightname))) {
						newmap.put(weightname, newweight);
					} else {
						double value = newmap.get(weightname);
						double newvalue = value + newweight;
						newmap.replace(weightname, newvalue);
					}
					
					String newlabel = weightname + "%label!%" + Double.toString(newweight).replace(" ", "");
					newlist.add(newlabel);
				}
				context.write(new Text(currdataarray[0].replace(" ", "") + "\t" + currdataarray[1].replace(" ", "")), new Text(newlist.toString().replace(" ", "").substring(1, newlist.toString().replace(" ", "").length() - 1)));
			}
			
			else {
				context.write(new Text(currdataarray[0]), new Text(currdataarray[1]));
			}
		}
		
		Set<String> keyset = newmap.keySet();
		Iterator<String> iter = keyset.iterator();
		while(iter.hasNext()) {
			String currkey = iter.next();
			double currdouble = newmap.get(currkey);
			context.write(new Text("#" + currkey + "%totalweight"), new Text(Double.toString(currdouble)));
		}
		
		
	}
	

}
